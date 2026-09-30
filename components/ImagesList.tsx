import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { File } from 'expo-file-system';
import { useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { captureRef } from 'react-native-view-shot';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useSettings } from '../context/SettingsContext';
import { radius, spacing } from '../theme/spacing';
import type { ThemeColors } from '../theme/colors';

export type PickedImage = {
  uri: string;
  sizeLabel: string;
  uploadStatus?: 'uploading' | 'uploaded' | 'error';
};

type Props = {
  images: PickedImage[];
  onAdd: (image: PickedImage) => void;
  onUpload: () => void;
  uploading?: boolean;
  label?: string;
};

// Upload reliability: full-resolution camera photos can be several MB, which
// makes the multipart upload much more likely to time out or drop on a weak
// connection. Downscaling to a sane max width before upload keeps payloads
// small without a visible quality loss for a mounting/removal proof photo.
const MAX_WIDTH = 1200;

type LocationDetails = {
  placeName: string;
  addressLine: string;
  flag: string;
  latText: string;
  lngText: string;
  mapTileUri: string;
};

type StampJob = {
  uri: string;
  width: number;
  height: number;
  dateText: string;
  timeText: string;
  gmtText: string;
  location: LocationDetails | null;
  showDateTime: boolean;
};

// A-Z ISO country code -> regional indicator emoji flag (e.g. "IN" -> 🇮🇳).
function flagFromIso(iso?: string | null): string {
  if (!iso || iso.length !== 2) return '';
  return iso
    .toUpperCase()
    .replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));
}

function formatStampDate(date: Date): string {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  return `${dd}.${mm}.${date.getFullYear()}`;
}

// Standard slippy-map tile lookup (OpenStreetMap) — turns a lat/lon into the
// single tile that contains it, so the stamp can show a small map thumbnail
// without needing a paid maps API key.
const MAP_TILE_ZOOM = 16;
function mapTileUrl(lat: number, lon: number): string {
  const latRad = (lat * Math.PI) / 180;
  const n = 2 ** MAP_TILE_ZOOM;
  const x = Math.floor(((lon + 180) / 360) * n);
  const y = Math.floor(((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n);
  return `https://tile.openstreetmap.org/${MAP_TILE_ZOOM}/${x}/${y}.png`;
}

function formatGmtOffset(date: Date): string {
  const offsetMin = -date.getTimezoneOffset();
  const sign = offsetMin >= 0 ? '+' : '-';
  const abs = Math.abs(offsetMin);
  const hh = String(Math.floor(abs / 60)).padStart(2, '0');
  const mm = String(abs % 60).padStart(2, '0');
  return `GMT${sign}${hh}:${mm}`;
}

async function getLocationDetails(): Promise<LocationDetails | null> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return null;
    const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    const { latitude, longitude } = position.coords;

    let placeName = 'Unknown location';
    let addressLine = '';
    let flag = '';
    try {
      const [place] = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (place) {
        placeName = [place.city, place.region].filter(Boolean).join(', ') || place.name || placeName;
        addressLine = [place.streetNumber, place.street, place.district, place.city, place.region, place.postalCode]
          .filter(Boolean)
          .join(', ');
        flag = flagFromIso(place.isoCountryCode);
      }
    } catch {
      // Reverse geocoding is best-effort — coordinates alone are still useful.
    }

    return {
      placeName,
      addressLine,
      flag,
      latText: `${Math.abs(latitude).toFixed(6)}°${latitude >= 0 ? 'N' : 'S'}`,
      lngText: `${Math.abs(longitude).toFixed(6)}°${longitude >= 0 ? 'E' : 'W'}`,
      mapTileUri: mapTileUrl(latitude, longitude),
    };
  } catch {
    return null;
  }
}

function waitForNextFrame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
}

export function ImagesList({ images, onAdd, onUpload, uploading, label = 'Add images' }: Props) {
  const { colors } = useTheme();
  const { geotagPhotos, dateTimeStamp } = useSettings();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const stampRef = useRef<View>(null);
  const [stampJob, setStampJob] = useState<StampJob | null>(null);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  // Resolved by the hidden photo's onLoad — capturing before the bitmap has
  // actually decoded and painted produces a blank/black capture.
  const imageLoadedRef = useRef<(() => void) | null>(null);
  // Same idea for the map tile thumbnail, which loads over the network and
  // can easily still be blank when the photo itself has already finished.
  const mapLoadedRef = useRef<(() => void) | null>(null);

  const addAsset = async (asset: ImagePicker.ImagePickerAsset) => {
    try {
      const context = ImageManipulator.manipulate(asset.uri);
      if (asset.width > MAX_WIDTH) {
        context.resize({ width: MAX_WIDTH });
      }
      const rendered = await context.renderAsync();
      const saved = await rendered.saveAsync({ compress: 0.7, format: SaveFormat.JPEG });

      let kb = 0;
      try {
        kb = Math.max(1, Math.round(new File(saved.uri).size / 1024));
      } catch {
        kb = 0;
      }

      onAdd({ uri: saved.uri, sizeLabel: kb ? `Size: ${kb}KB` : 'Ready to upload' });
    } catch {
      // Manipulation failed (rare) — fall back to the original picked asset
      // rather than blocking the user from attaching a photo at all.
      const kb = asset.fileSize ? Math.max(1, Math.round(asset.fileSize / 1024)) : 20;
      onAdd({ uri: asset.uri, sizeLabel: `Size: ${kb}KB` });
    }
  };

  // Burns the date/time + location (GPS Map Camera style) directly into the
  // photo pixels via a hidden off-screen view + react-native-view-shot, so
  // the stamp is visible proof on the image itself, not just file metadata.
  const addStampedAsset = async (asset: ImagePicker.ImagePickerAsset) => {
    // asset.width/height from the camera picker can be the pre-EXIF-rotation
    // sensor dimensions on some Android devices (e.g. landscape 4000x3000
    // reported for a photo that actually displays as portrait 3000x4000).
    // Image.getSize reads the same orientation-corrected size the Image
    // below will render, so the capture box's aspect ratio actually matches
    // the photo and resizeMode="cover" doesn't crop it.
    const naturalSize = await new Promise<{ width: number; height: number }>((resolve) => {
      Image.getSize(
        asset.uri,
        (w, h) => resolve({ width: w, height: h }),
        () => resolve({ width: asset.width || MAX_WIDTH, height: asset.height || asset.width || MAX_WIDTH })
      );
    });
    const width = Math.min(naturalSize.width || MAX_WIDTH, MAX_WIDTH);
    const height = Math.round(width * ((naturalSize.height || naturalSize.width || 1) / (naturalSize.width || 1)));
    const now = new Date();
    // Geotag Photos and Add Date & Time are mutually exclusive — only fetch
    // location when the geotag stamp (not the date/time-only stamp) is on.
    const location = geotagPhotos ? await getLocationDetails() : null;

    setStampJob({
      uri: asset.uri,
      width,
      height,
      dateText: formatStampDate(now),
      timeText: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      gmtText: formatGmtOffset(now),
      location,
      showDateTime: dateTimeStamp,
    });

    const imageLoaded = new Promise<void>((resolve) => {
      imageLoadedRef.current = resolve;
      // Safety net in case onLoad never fires on some device/image — don't
      // let the whole upload hang forever, just capture whatever is there.
      setTimeout(resolve, 4000);
    });
    const mapLoaded = location
      ? new Promise<void>((resolve) => {
          mapLoadedRef.current = resolve;
          setTimeout(resolve, 4000);
        })
      : Promise.resolve();
    await Promise.all([imageLoaded, mapLoaded]);
    await waitForNextFrame();

    try {
      const uri = await captureRef(stampRef, { format: 'jpg', quality: 0.85, width, height });
      let kb = 0;
      try {
        kb = Math.max(1, Math.round(new File(uri).size / 1024));
      } catch {
        kb = 0;
      }
      onAdd({ uri, sizeLabel: kb ? `Size: ${kb}KB` : 'Ready to upload' });
    } catch {
      // Stamping failed (rare) — still attach the photo unstamped rather
      // than blocking the user entirely.
      await addAsset(asset);
    } finally {
      setStampJob(null);
    }
  };

  const addFromResult = async (result: ImagePicker.ImagePickerResult, stamp: boolean) => {
    if (result.canceled || result.assets.length === 0) return;
    for (const asset of result.assets) {
      if (stamp && (geotagPhotos || dateTimeStamp)) {
        await addStampedAsset(asset);
      } else {
        await addAsset(asset);
      }
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchCameraAsync({ quality: 0.9 });
    // Geotag stamping only applies to photos taken live with the camera —
    // a gallery pick has no meaningful "current location/time" to attach.
    addFromResult(result, true);
  };

  const pickFromGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.9,
      allowsMultipleSelection: true,
    });
    addFromResult(result, false);
  };

  const addImage = () => {
    Alert.alert('Add Image', 'Choose an option', [
      { text: 'Take Photo', onPress: takePhoto },
      { text: 'Choose from Gallery', onPress: pickFromGallery },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <View>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Pressable style={styles.addButton} onPress={addImage}>
          <Ionicons name="add" size={18} color={colors.white} />
        </Pressable>
      </View>

      <View style={styles.grid}>
        {images.map((image, index) => (
          <View key={`${image.uri}-${index}`} style={styles.thumbWrap}>
            <Pressable onPress={() => setPreviewUri(image.uri)}>
              <Image source={{ uri: image.uri }} style={styles.thumb} />
            </Pressable>
            {image.uploadStatus === 'uploading' ? (
              <View style={styles.statusOverlay}>
                <ActivityIndicator color={colors.white} size="small" />
              </View>
            ) : image.uploadStatus === 'uploaded' ? (
              <View style={[styles.statusBadge, { backgroundColor: colors.success }]}>
                <Ionicons name="checkmark" size={12} color={colors.white} />
              </View>
            ) : image.uploadStatus === 'error' ? (
              <View style={[styles.statusBadge, { backgroundColor: colors.danger }]}>
                <Ionicons name="close" size={12} color={colors.white} />
              </View>
            ) : null}
            <Text style={styles.sizeLabel}>
              {image.uploadStatus === 'uploading'
                ? 'Uploading…'
                : image.uploadStatus === 'error'
                ? 'Upload failed'
                : image.sizeLabel}
            </Text>
          </View>
        ))}
      </View>

      <Pressable
        style={[styles.uploadButton, (uploading || images.length === 0) && styles.uploadButtonDisabled]}
        onPress={onUpload}
        disabled={uploading || images.length === 0}
      >
        {uploading ? (
          <ActivityIndicator color={colors.primaryStart} size="small" />
        ) : (
          <>
            <Ionicons name="cloud-upload-outline" size={18} color={colors.primaryStart} />
            <Text style={styles.uploadButtonText}>Upload Photo</Text>
          </>
        )}
      </Pressable>

      {stampJob ? (
        <View style={styles.stampCaptureWrap} pointerEvents="none">
          <View
            ref={stampRef}
            collapsable={false}
            style={{ width: stampJob.width, height: stampJob.height }}
          >
            <Image
              source={{ uri: stampJob.uri }}
              style={{ width: stampJob.width, height: stampJob.height }}
              resizeMode="cover"
              // Android fades images in over ~300ms by default; capturing
              // mid-fade grabs a partially transparent bitmap, which gets
              // flattened onto black when encoded as JPEG (no alpha channel)
              // — darkening the photo relative to the opaque stamp box.
              fadeDuration={0}
              onLoadEnd={() => imageLoadedRef.current?.()}
            />
            {stampJob.location ? (
              <LinearGradient
                colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.35)', 'rgba(0,0,0,0.7)']}
                locations={[0, 0.4, 1]}
                style={styles.stampOverlay}
              >
                <View style={styles.stampRow}>
                  <View style={styles.stampMapWrap}>
                    <Image
                      source={{ uri: stampJob.location.mapTileUri }}
                      style={styles.stampMapTile}
                      fadeDuration={0}
                      onLoadEnd={() => mapLoadedRef.current?.()}
                    />
                    <View style={styles.stampMapPin} pointerEvents="none">
                      <Ionicons name="location" size={22} color="#EA4335" />
                    </View>
                  </View>
                  <View style={styles.stampInfo}>
                    <View style={styles.stampPlaceRow}>
                      <Text style={styles.stampPlace} numberOfLines={1}>
                        {stampJob.location.placeName}
                      </Text>
                      {stampJob.location.flag ? (
                        <Text style={styles.stampFlag}>{stampJob.location.flag}</Text>
                      ) : null}
                    </View>
                    {stampJob.location.addressLine ? (
                      <Text style={styles.stampAddress} numberOfLines={2}>
                        {stampJob.location.addressLine}
                      </Text>
                    ) : null}
                    <Text style={styles.stampMeta}>
                      Lat {stampJob.location.latText} Long {stampJob.location.lngText}
                    </Text>
                    <Text style={styles.stampMeta}>
                      {stampJob.dateText}, {stampJob.timeText} {stampJob.gmtText}
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            ) : stampJob.showDateTime ? (
              // Date/time-only mode: a plain red watermark in the bottom-right
              // corner, no background box — distinct from the geotag stamp's
              // transparent gradient info panel.
              <View style={styles.stampDateTimeCorner} pointerEvents="none">
                <Text style={styles.stampDateTimeText}>{stampJob.dateText}</Text>
                <Text style={styles.stampDateTimeText}>{stampJob.timeText}</Text>
              </View>
            ) : null}
          </View>
        </View>
      ) : null}

      <Modal
        visible={!!previewUri}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewUri(null)}
      >
        <Pressable style={styles.previewBackdrop} onPress={() => setPreviewUri(null)}>
          <Image source={{ uri: previewUri ?? undefined }} style={styles.previewImage} resizeMode="contain" />
          <Pressable style={styles.previewClose} onPress={() => setPreviewUri(null)}>
            <Ionicons name="close" size={22} color={colors.white} />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.sm,
    },
    label: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
    },
    addButton: {
      width: 28,
      height: 28,
      borderRadius: 8,
      backgroundColor: colors.primaryStart,
      alignItems: 'center',
      justifyContent: 'center',
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    thumbWrap: {
      width: '23%',
      alignItems: 'center',
    },
    thumb: {
      width: '100%',
      aspectRatio: 1,
      borderRadius: radius.md,
      backgroundColor: colors.surfaceMuted,
      borderWidth: 1,
      borderColor: colors.border,
    },
    statusOverlay: {
      ...StyleSheet.absoluteFill,
      borderRadius: radius.md,
      backgroundColor: 'rgba(0,0,0,0.35)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    statusBadge: {
      position: 'absolute',
      top: 4,
      right: 4,
      width: 18,
      height: 18,
      borderRadius: 9,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sizeLabel: {
      marginTop: 4,
      fontSize: 11,
      color: colors.textMuted,
    },
    uploadButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.pill,
      backgroundColor: colors.cardBlue,
      gap: spacing.xs,
    },
    uploadButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.primaryStart,
    },
    uploadButtonDisabled: {
      opacity: 0.5,
    },
    // Positioned off-screen (not display:none — view-shot can't capture an
    // unrendered/zero-size view) so the stamped composite is never visible
    // on screen before being captured as a new image. Must stay fully
    // opaque: opacity < 1 here bakes into the captured pixels since
    // captureRef snapshots the rendered layer, and JPEG has no alpha
    // channel, so a translucent capture gets flattened onto black —
    // darkening the photo relative to the opaque stamp box.
    stampCaptureWrap: {
      position: 'absolute',
      top: 0,
      left: -9999,
    },
    stampOverlay: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      padding: 10,
      paddingTop: 24,
    },
    stampRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: 10,
    },
    stampMapWrap: {
      width: 64,
      height: 64,
      borderRadius: 8,
      overflow: 'hidden',
      backgroundColor: '#DDE3E8',
    },
    stampMapTile: {
      width: '100%',
      height: '100%',
    },
    stampMapPin: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 6,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stampInfo: {
      flex: 1,
    },
    stampPlaceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    stampPlace: {
      flexShrink: 1,
      color: '#FFFFFF',
      fontSize: 24,
      fontWeight: '700',
      textShadowColor: 'rgba(0,0,0,0.7)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 3,
    },
    stampFlag: {
      fontSize: 24,
    },
    stampAddress: {
      color: '#EDEDED',
      fontSize: 18,
      marginTop: 3,
      textShadowColor: 'rgba(0,0,0,0.7)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 3,
    },
    stampMeta: {
      color: '#EDEDED',
      fontSize: 18,
      fontWeight: '600',
      marginTop: 3,
      textShadowColor: 'rgba(0,0,0,0.7)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 3,
    },
    stampDateTimeCorner: {
      position: 'absolute',
      right: 10,
      bottom: 8,
      alignItems: 'flex-end',
    },
    stampDateTimeText: {
      color: '#E8342B',
      fontSize: 24,
      fontWeight: '700',
      textShadowColor: 'rgba(0,0,0,0.6)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 3,
    },
    previewBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.9)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    previewImage: {
      width: '100%',
      height: '80%',
    },
    previewClose: {
      position: 'absolute',
      top: spacing.xxl,
      right: spacing.lg,
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: 'rgba(255,255,255,0.15)',
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}
