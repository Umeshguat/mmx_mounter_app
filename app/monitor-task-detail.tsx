import { useEffect, useMemo, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Alert, Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { radius, spacing } from '../theme/spacing';
import type { ThemeColors } from '../theme/colors';
import { Card } from '../components/Card';
import { ImagesList, type PickedImage } from '../components/ImagesList';
import { ScreenHeader, useScreenHeaderHeight } from '../components/ScreenHeader';
import { ScreenGradient } from '../components/ScreenGradient';
import { getTaskDetail, uploadMonitorPhoto, type DayType } from '../services/api';
import { capitalizeFirst } from '../utils/format';

const MEDIA_PHOTO_KEYS = ['media_photo', 'photo_url', 'image_url', 'media_image', 'media_photo_url'];
const LOCATION_KEYS = ['location', 'address', 'site_location', 'site_address'];
// Arrays of {photo_id, image_url}-shaped objects — rendered as thumbnail
// strips below, same treatment as the mounter's task-detail.tsx screen.
const PHOTO_ARRAY_KEYS = ['mounting_photos', 'removal_photos'];

// Pulls a usable image URL out of whatever shape the API sends a photo
// object in ({image_url}/{imageUrl}/{url}, or a bare string URL).
function photoUrlOf(item: any): string | undefined {
  if (typeof item === 'string') return item;
  return item?.image_url ?? item?.imageUrl ?? item?.photo_url ?? item?.url ?? undefined;
}

function humanizeKey(key: string): string {
  return key
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

const DETAIL_FIELDS: { keys: string[]; label: string; format?: (value: string) => string; alwaysShow?: boolean }[] = [
  { keys: ['campaign_name', 'campaignname'], label: 'Campaign Name', format: capitalizeFirst },
  { keys: ['media_type'], label: 'Media Type', alwaysShow: true },
  { keys: ['media_name'], label: 'Media Name' },
  { keys: ['media_code'], label: 'Media Code' },
  // The backend often sends both media_size and size as null — still shown
  // (as "-") rather than silently dropped, so the field's absence is visible.
  { keys: ['media_size', 'size'], label: 'Size', alwaysShow: true },
  { keys: ['light_type', 'lighting_type'], label: 'Light Type', alwaysShow: true },
  { keys: ['order_number'], label: 'Order Number' },
  { keys: ['start_date'], label: 'Start Date' },
  { keys: ['end_date'], label: 'End Date' },
];

function fieldOf(task: Record<string, any> | null, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = task?.[key];
    if (value !== undefined && value !== null && value !== '') return String(value);
  }
  return undefined;
}

const DEFAULT_REMARKS = 'Monitored via mobile app';

export default function MonitorTaskDetail() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const headerHeight = useScreenHeaderHeight();
  // cartId is for GET /field/task/:cartId (task details) — confirmed correct.
  // cartMonitorId is for POST /field/monitor/:cartMonitorId/photo, which is
  // a different id (the monitor-assignment row's own id, not the task's
  // cart_id) — falls back to cartId if the worklist row didn't have one.
  const { cartId, cartMonitorId: cartMonitorIdParam } = useLocalSearchParams<{
    cartId: string;
    cartMonitorId?: string;
  }>();
  const cartMonitorId = cartMonitorIdParam ?? cartId;

  const [task, setTask] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewUri, setPreviewUri] = useState<string | null>(null);

  useEffect(() => {
    if (!cartId) return;
    setLoading(true);
    setError(null);
    getTaskDetail(cartId)
      .then(setTask)
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load task details.'))
      .finally(() => setLoading(false));
  }, [cartId]);

  const title = task?.media_name ?? task?.title ?? `Task #${cartId}`;
  const mediaPhoto = fieldOf(task, MEDIA_PHOTO_KEYS);
  const location = fieldOf(task, LOCATION_KEYS);
  const detailRows = DETAIL_FIELDS.map(({ keys, label, format, alwaysShow }) => {
    const value = fieldOf(task, keys);
    const display = value !== undefined && format ? format(value) : value;
    return { label, value: display ?? (alwaysShow ? '-' : undefined) };
  }).filter((row) => row.value !== undefined);
  const photoGroups = PHOTO_ARRAY_KEYS.map((key) => ({
    key,
    label: humanizeKey(key),
    urls: (Array.isArray(task?.[key]) ? task![key] : []).map(photoUrlOf).filter((u): u is string => !!u),
  })).filter((group) => group.urls.length > 0);

  const [photos, setPhotos] = useState<PickedImage[]>([]);
  const [uploading, setUploading] = useState(false);
  // Defaults to the current local time of day; the monitor can override it
  // below (e.g. photographing a night-light board's daytime appearance).
  const [dayType, setDayType] = useState<DayType>(() => {
    const hour = new Date().getHours();
    return hour >= 6 && hour < 18 ? 0 : 1;
  });

  const onAddPhoto = (image: PickedImage) => {
    setPhotos((prev) => [...prev, image]);
  };

  const onUploadPhotos = async () => {
    if (!cartMonitorId) return;
    const pending = photos.filter((p) => p.uploadStatus !== 'uploaded');
    if (pending.length === 0) return;

    setUploading(true);
    setPhotos((prev) =>
      prev.map((p) => (p.uploadStatus !== 'uploaded' ? { ...p, uploadStatus: 'uploading' } : p))
    );
    try {
      await uploadMonitorPhoto(cartMonitorId, pending, dayType, DEFAULT_REMARKS);
      setPhotos((prev) =>
        prev.map((p) => (p.uploadStatus === 'uploading' ? { ...p, uploadStatus: 'uploaded' } : p))
      );
      Alert.alert('Photo uploaded', 'Your monitoring photo has been submitted.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err) {
      setPhotos((prev) =>
        prev.map((p) => (p.uploadStatus === 'uploading' ? { ...p, uploadStatus: 'error' } : p))
      );
      Alert.alert('Upload failed', err instanceof Error ? err.message : 'Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <ScreenGradient style={styles.container}>
      <ScreenHeader title="Task Detail" />

      {loading ? (
        <ActivityIndicator
          color={colors.primaryStart}
          style={[styles.loading, { marginTop: headerHeight + spacing.lg }]}
        />
      ) : error ? (
        <Text style={[styles.errorText, { marginTop: headerHeight + spacing.lg }]}>{error}</Text>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.content, { paddingTop: headerHeight + spacing.lg }]}
          showsVerticalScrollIndicator={false}
        >
          <Card tint="muted" style={styles.mediaCard}>
            {mediaPhoto ? (
              <Pressable onPress={() => setPreviewUri(mediaPhoto)}>
                <Image source={{ uri: mediaPhoto }} style={styles.mediaPhoto} resizeMode="cover" />
              </Pressable>
            ) : (
              <View style={styles.mediaPhotoPlaceholder}>
                <Ionicons name="image-outline" size={32} color={colors.textFaint} />
              </View>
            )}
            <Text style={styles.title}>{title}</Text>
            {location ? <Text style={styles.location}>{location}</Text> : null}
          </Card>

          <Card tint="muted" style={styles.card}>
            {detailRows.map((row, index) => (
              <View key={row.label} style={[styles.row, index === detailRows.length - 1 && styles.rowLast]}>
                <Text style={styles.label}>{row.label}</Text>
                <Text style={styles.value}>{row.value}</Text>
              </View>
            ))}
          </Card>

          {photoGroups.map((group) => (
            <Card key={group.key} tint="muted" style={styles.section}>
              <Text style={styles.photoGroupLabel}>{group.label}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photoGroupRow}>
                {group.urls.map((url, index) => (
                  <Pressable key={`${url}-${index}`} onPress={() => setPreviewUri(url)}>
                    <Image source={{ uri: url }} style={styles.photoGroupThumb} resizeMode="cover" />
                  </Pressable>
                ))}
              </ScrollView>
            </Card>
          ))}

          <Card tint="muted" style={styles.section}>
            <Text style={styles.photoGroupLabel}>Photo Time</Text>
            <View style={styles.dayTypeRow}>
              <Pressable
                style={[styles.dayTypeOption, dayType === 0 && styles.dayTypeOptionActive]}
                onPress={() => setDayType(0)}
              >
                <Ionicons
                  name="sunny-outline"
                  size={16}
                  color={dayType === 0 ? colors.white : colors.textMuted}
                />
                <Text style={[styles.dayTypeText, dayType === 0 && styles.dayTypeTextActive]}>Day</Text>
              </Pressable>
              <Pressable
                style={[styles.dayTypeOption, dayType === 1 && styles.dayTypeOptionActive]}
                onPress={() => setDayType(1)}
              >
                <Ionicons
                  name="moon-outline"
                  size={16}
                  color={dayType === 1 ? colors.white : colors.textMuted}
                />
                <Text style={[styles.dayTypeText, dayType === 1 && styles.dayTypeTextActive]}>Night</Text>
              </Pressable>
            </View>
          </Card>

          <Card tint="muted" style={styles.section}>
            <ImagesList
              label="Upload Photos"
              images={photos}
              onAdd={onAddPhoto}
              onUpload={onUploadPhotos}
              uploading={uploading}
            />
          </Card>
        </ScrollView>
      )}

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
    </ScreenGradient>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'transparent',
    },
    content: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.xxl,
    },
    loading: {
      alignSelf: 'center',
    },
    errorText: {
      fontSize: 14,
      color: colors.danger,
      textAlign: 'center',
      paddingHorizontal: spacing.lg,
    },
    mediaCard: {
      marginBottom: spacing.md,
    },
    mediaPhoto: {
      width: '100%',
      height: 180,
      borderRadius: radius.md,
      backgroundColor: colors.surfaceMuted,
      marginBottom: spacing.md,
    },
    mediaPhotoPlaceholder: {
      width: '100%',
      height: 180,
      borderRadius: radius.md,
      backgroundColor: colors.surfaceMuted,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.md,
    },
    title: {
      fontSize: 22,
      fontWeight: '800',
      color: colors.text,
    },
    location: {
      marginTop: 2,
      fontSize: 14,
      color: colors.textMuted,
    },
    card: {
      paddingVertical: 0,
      paddingHorizontal: spacing.md,
      marginBottom: spacing.md,
    },
    section: {
      marginBottom: spacing.md,
    },
    photoGroupLabel: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.sm,
    },
    photoGroupRow: {
      gap: spacing.sm,
    },
    photoGroupThumb: {
      width: 72,
      height: 72,
      borderRadius: radius.md,
      backgroundColor: colors.surfaceMuted,
      borderWidth: 1,
      borderColor: colors.border,
    },
    dayTypeRow: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    dayTypeOption: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
      paddingVertical: spacing.sm,
      borderRadius: radius.pill,
      borderWidth: 1,
      borderColor: colors.border,
    },
    dayTypeOptionActive: {
      backgroundColor: colors.primaryStart,
      borderColor: colors.primaryStart,
    },
    dayTypeText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textMuted,
    },
    dayTypeTextActive: {
      color: colors.white,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      gap: spacing.md,
    },
    rowLast: {
      borderBottomWidth: 0,
    },
    label: {
      fontSize: 14,
      color: colors.textMuted,
    },
    value: {
      flex: 1,
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      textAlign: 'right',
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
