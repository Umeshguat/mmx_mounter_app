import { useEffect, useMemo, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { spacing } from '../theme/spacing';
import type { ThemeColors } from '../theme/colors';
import { Card } from '../components/Card';
import { TextField } from '../components/TextField';
import { GradientButton } from '../components/GradientButton';
import { ImagesList, type PickedImage } from '../components/ImagesList';
import { ScreenHeader, useScreenHeaderHeight } from '../components/ScreenHeader';
import { ScreenGradient } from '../components/ScreenGradient';
import { getTaskDetail, updateTask, completeTask } from '../services/api';

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

  const [remarks, setRemarks] = useState('');
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

  const hasUploadedPhoto = photos.some((p) => p.uploadStatus === 'uploaded');
  const canSubmit = hasUploadedPhoto;

  // Picking a photo only stages it locally — no API call here. The actual
  // upload only happens when "Upload Photo" is pressed below.
  const onAddPhoto = (image: PickedImage) => {
    setPhotos((prev) => [...prev, image]);
  };

  // Uploads every photo that hasn't been uploaded yet, in one explicit
  // button press. The server requires a non-empty remarks field on every
  // /update call, so this reuses whatever's currently typed in the Remarks
  // box (falling back to a default if it's still empty) — "Task Done" below
  // does the separate final call that actually completes the task.
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
        remarks: remarks.trim() || 'Photo uploaded',
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
      await completeTask(cartId, remarks.trim(), isRemovalJob ? 11 : 5);
      // The worklist this task came from re-fetches on regaining focus via
      // useFocusEffect — a completed task drops out of "today"/"pending"/etc.
      // server-side, so it disappears from that list once we pop back to it.
      Alert.alert('Task updated', 'Your remarks and photos have been submitted.', [
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
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            contentContainerStyle={[styles.content, { paddingTop: headerHeight + spacing.lg }]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.title}>{title}</Text>

            <Card tint="muted" style={styles.card}>
              {rows.map(([key, value], index) => (
                <View key={key} style={[styles.row, index === rows.length - 1 && styles.rowLast]}>
                  <Text style={styles.label}>{humanizeKey(key)}</Text>
                  <Text style={styles.value}>{String(value)}</Text>
                </View>
              ))}
            </Card>

            <Card tint="muted" style={styles.section}>
              <Text style={styles.fieldLabel}>Remarks</Text>
              <TextField
                icon="chatbubble-ellipses-outline"
                placeholder="Enter remarks for this visit"
                value={remarks}
                onChangeText={setRemarks}
                multiline
                numberOfLines={3}
                style={styles.remarksInput}
              />
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
        </KeyboardAvoidingView>
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
    flex: {
      flex: 1,
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
    title: {
      fontSize: 22,
      fontWeight: '800',
      color: colors.onBackground,
      marginBottom: spacing.lg,
    },
    card: {
      paddingVertical: 0,
      paddingHorizontal: spacing.md,
      marginBottom: spacing.md,
    },
    section: {
      marginBottom: spacing.md,
    },
    fieldLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.xs,
    },
    remarksInput: {
      height: 80,
      paddingTop: spacing.sm,
      textAlignVertical: 'top',
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
