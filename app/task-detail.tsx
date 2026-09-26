import { useEffect, useMemo, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { radius, spacing } from '../theme/spacing';
import type { ThemeColors } from '../theme/colors';
import { Card } from '../components/Card';
import { GradientButton } from '../components/GradientButton';
import { ImagesList, type PickedImage } from '../components/ImagesList';
import { ScreenHeader, useScreenHeaderHeight } from '../components/ScreenHeader';
import { ScreenGradient } from '../components/ScreenGradient';
import { getTaskDetail, updateTask, completeTask } from '../services/api';
import { capitalizeFirst } from '../utils/format';

// No remarks UI anymore, but the backend still requires a non-empty
// `remarks` field on both /update (photo upload) and /status (task done).
const DEFAULT_REMARKS = 'Task completed via mobile app';

// Fields pulled out into the dedicated media block up top, so they're
// hidden from the generic key/value table below to avoid duplication.
const MEDIA_PHOTO_KEYS = ['media_photo', 'photo_url', 'image_url', 'media_image', 'media_photo_url'];
const MEDIA_SIZE_KEYS = ['media_size', 'size', 'hoarding_size', 'board_size'];
const LIGHT_TYPE_KEYS = ['light_type', 'lighting_type', 'light'];
const LOCATION_KEYS = ['location', 'address', 'site_location', 'site_address'];

const META_KEYS = new Set([
  'error',
  'errorcode',
  'cart_id',
  'campaign_id',
  'media_id',
  'media_type',
  'quantity',
  'mounter_id',
  'cart_status',
  'added_on',
  'media_name',
  ...MEDIA_PHOTO_KEYS,
  ...MEDIA_SIZE_KEYS,
  ...LIGHT_TYPE_KEYS,
  ...LOCATION_KEYS,
]);

const LABEL_OVERRIDES: Record<string, string> = {
  order_number: 'Order Number',
  media_code: 'Media Code',
  start_date: 'Start Date',
  end_date: 'End Date',
  mounter_name: 'Mounter',
  vendor_name: 'Vendor',
};

function humanizeKey(key: string): string {
  if (LABEL_OVERRIDES[key]) return LABEL_OVERRIDES[key];
  return key
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function fieldOf(task: Record<string, any> | null, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = task?.[key];
    if (value !== undefined && value !== null && value !== '') return String(value);
  }
  return undefined;
}

export default function TaskDetail() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const headerHeight = useScreenHeaderHeight();
  const { cartId, type } = useLocalSearchParams<{ cartId: string; type?: string }>();

  // Worklist type tells us which kind of task this is: mounting_removal/
  // pending_mounting_removal are removal jobs, everything else (today/pending/
  // advance/unknown) is treated as a mounting job — either way only one photo
  // set is ever relevant for a given task, so there's a single upload section.
  const isRemovalJob = type === 'mounting_removal' || type === 'pending_mounting_removal';

  const [task, setTask] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [photos, setPhotos] = useState<PickedImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!cartId) return;
    setLoading(true);
    setError(null);
    getTaskDetail(cartId)
      .then(setTask)
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load task details.'))
      .finally(() => setLoading(false));
  }, [cartId]);

  const rows = task
    ? Object.entries(task).filter(([key, value]) => !META_KEYS.has(key) && value !== null && value !== '')
    : [];
  const title = task?.media_name ?? task?.title ?? 'Task Detail';
  const mediaPhoto = fieldOf(task, MEDIA_PHOTO_KEYS);
  const location = fieldOf(task, LOCATION_KEYS);
  const mediaSize = fieldOf(task, MEDIA_SIZE_KEYS);
  const lightType = fieldOf(task, LIGHT_TYPE_KEYS);

  const hasUploadedPhoto = photos.some((p) => p.uploadStatus === 'uploaded');
  const canSubmit = hasUploadedPhoto;

  // Picking a photo only stages it locally — no API call here. The actual
  // upload only happens when "Upload Photo" is pressed below.
  const onAddPhoto = (image: PickedImage) => {
    setPhotos((prev) => [...prev, image]);
  };

  // Uploads every photo that hasn't been uploaded yet, in one explicit
  // button press. "Task Done" below does the separate final call.
  const onUploadPhotos = async () => {
    if (!cartId) return;
    const pending = photos.filter((p) => p.uploadStatus !== 'uploaded');
    if (pending.length === 0) return;

    setUploading(true);
    setPhotos((prev) =>
      prev.map((p) => (p.uploadStatus !== 'uploaded' ? { ...p, uploadStatus: 'uploading' } : p))
    );
    try {
      await updateTask(cartId, {
        remarks: DEFAULT_REMARKS,
        mountingPhotos: isRemovalJob ? [] : pending,
        removalPhotos: isRemovalJob ? pending : [],
      });
      setPhotos((prev) =>
        prev.map((p) => (p.uploadStatus === 'uploading' ? { ...p, uploadStatus: 'uploaded' } : p))
      );
    } catch (err) {
      setPhotos((prev) =>
        prev.map((p) => (p.uploadStatus === 'uploading' ? { ...p, uploadStatus: 'error' } : p))
      );
      Alert.alert('Upload failed', err instanceof Error ? err.message : 'Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async () => {
    if (!cartId) {
      Alert.alert('Could not update task', 'This task is missing its ID — please go back and open it again.');
      return;
    }
    if (!canSubmit) {
      Alert.alert('Upload a photo first', 'Please tap "Upload Photo" and wait for it to finish before marking this task done.');
      return;
    }
    setSubmitting(true);
    try {
      await completeTask(cartId, DEFAULT_REMARKS, isRemovalJob ? 11 : 5);
      // The worklist this task came from re-fetches on regaining focus via
      // useFocusEffect — a completed task drops out of "today"/"pending"/etc.
      // server-side, so it disappears from that list once we pop back to it.
      Alert.alert('Task updated', 'Your photos have been submitted.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err) {
      Alert.alert('Could not update task', err instanceof Error ? err.message : 'Please try again.');
    } finally {
      setSubmitting(false);
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
              <Image source={{ uri: mediaPhoto }} style={styles.mediaPhoto} resizeMode="cover" />
            ) : (
              <View style={styles.mediaPhotoPlaceholder}>
                <Ionicons name="image-outline" size={32} color={colors.textFaint} />
              </View>
            )}
            <Text style={styles.title}>{title}</Text>
            {location ? <Text style={styles.location}>{location}</Text> : null}

            <View style={styles.mediaMetaRow}>
              {mediaSize ? (
                <View style={styles.mediaMetaItem}>
                  <Ionicons name="resize-outline" size={16} color={colors.textMuted} />
                  <Text style={styles.mediaMetaText}>{mediaSize}</Text>
                </View>
              ) : null}
              {lightType ? (
                <View style={styles.mediaMetaItem}>
                  <Ionicons name="bulb-outline" size={16} color={colors.textMuted} />
                  <Text style={styles.mediaMetaText}>{lightType}</Text>
                </View>
              ) : null}
            </View>
          </Card>

          <Card tint="muted" style={styles.card}>
            {rows.map(([key, value], index) => {
              const display = key === 'campaign_name' ? capitalizeFirst(String(value)) : String(value);
              return (
                <View key={key} style={[styles.row, index === rows.length - 1 && styles.rowLast]}>
                  <Text style={styles.label}>{humanizeKey(key)}</Text>
                  <Text style={styles.value}>{display}</Text>
                </View>
              );
            })}
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

          <GradientButton
            label="Task Done"
            icon="checkmark"
            onPress={onSubmit}
            loading={submitting}
            style={styles.submitButton}
          />
        </ScrollView>
      )}
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
    mediaMetaRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.md,
      marginTop: spacing.md,
    },
    mediaMetaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    mediaMetaText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    card: {
      paddingVertical: 0,
      paddingHorizontal: spacing.md,
      marginBottom: spacing.md,
    },
    section: {
      marginBottom: spacing.md,
    },
    submitButton: {
      marginTop: spacing.lg,
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
  });
}
