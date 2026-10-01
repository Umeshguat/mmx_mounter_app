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
import { getTaskDetail, uploadMonitorPhoto } from '../services/api';
import { capitalizeFirst } from '../utils/format';

const MEDIA_PHOTO_KEYS = ['media_photo', 'photo_url', 'image_url', 'media_image', 'media_photo_url'];
const LOCATION_KEYS = ['location', 'address', 'site_location', 'site_address'];

const DETAIL_FIELDS: { keys: string[]; label: string; format?: (value: string) => string; alwaysShow?: boolean }[] = [
  { keys: ['campaign_name', 'campaignname'], label: 'Campaign Name', format: capitalizeFirst },
  { keys: ['media_type'], label: 'Media Type' },
  { keys: ['media_name'], label: 'Media Name' },
  { keys: ['media_code'], label: 'Media Code' },
  // The backend often sends both media_size and size as null — still shown
  // (as "-") rather than silently dropped, so the field's absence is visible.
  { keys: ['media_size', 'size'], label: 'Size', alwaysShow: true },
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
  const { cartMonitorId } = useLocalSearchParams<{ cartMonitorId: string }>();

  const [task, setTask] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewUri, setPreviewUri] = useState<string | null>(null);

  useEffect(() => {
    if (!cartMonitorId) return;
    setLoading(true);
    setError(null);
    getTaskDetail(cartMonitorId)
      .then(setTask)
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load task details.'))
      .finally(() => setLoading(false));
  }, [cartMonitorId]);

  const title = task?.media_name ?? task?.title ?? `Task #${cartMonitorId}`;
  const mediaPhoto = fieldOf(task, MEDIA_PHOTO_KEYS);
  const location = fieldOf(task, LOCATION_KEYS);
  const detailRows = DETAIL_FIELDS.map(({ keys, label, format, alwaysShow }) => {
    const value = fieldOf(task, keys);
    const display = value !== undefined && format ? format(value) : value;
    return { label, value: display ?? (alwaysShow ? '-' : undefined) };
  }).filter((row) => row.value !== undefined);

  const [photos, setPhotos] = useState<PickedImage[]>([]);
  const [uploading, setUploading] = useState(false);

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
      await uploadMonitorPhoto(cartMonitorId, pending, DEFAULT_REMARKS);
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
