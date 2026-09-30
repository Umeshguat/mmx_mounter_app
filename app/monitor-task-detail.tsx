import { useMemo, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { spacing } from '../theme/spacing';
import type { ThemeColors } from '../theme/colors';
import { Card } from '../components/Card';
import { ImagesList, type PickedImage } from '../components/ImagesList';
import { ScreenHeader, useScreenHeaderHeight } from '../components/ScreenHeader';
import { ScreenGradient } from '../components/ScreenGradient';
import { uploadMonitorPhoto } from '../services/api';
import { capitalizeFirst } from '../utils/format';

// There's no dedicated "get monitor task" endpoint — the worklist row already
// carries everything this screen shows, so monitor-worklist.tsx passes it
// straight through as a serialized param instead of a second network call.
function parseItem(raw: string | undefined): Record<string, any> {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

const DETAIL_FIELDS: { keys: string[]; label: string; format?: (value: string) => string }[] = [
  { keys: ['campaign_name', 'campaignname'], label: 'Campaign Name', format: capitalizeFirst },
  { keys: ['media_type'], label: 'Media Type' },
  { keys: ['media_name'], label: 'Media Name' },
  { keys: ['media_code'], label: 'Media Code' },
  { keys: ['media_size', 'size'], label: 'Size' },
  { keys: ['order_number'], label: 'Order Number' },
  { keys: ['location', 'address'], label: 'Location' },
];

function fieldOf(task: Record<string, any>, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = task[key];
    if (value !== undefined && value !== null && value !== '') return String(value);
  }
  return undefined;
}

const DEFAULT_REMARKS = 'Monitored via mobile app';

export default function MonitorTaskDetail() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const headerHeight = useScreenHeaderHeight();
  const { cartMonitorId, item } = useLocalSearchParams<{ cartMonitorId: string; item?: string }>();

  const task = useMemo(() => parseItem(item), [item]);
  const title = task.media_name ?? task.title ?? `Task #${cartMonitorId}`;
  const rows = DETAIL_FIELDS.map(({ keys, label, format }) => {
    const value = fieldOf(task, keys);
    return { label, value: value !== undefined && format ? format(value) : value };
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

      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: headerHeight + spacing.lg }]}
        showsVerticalScrollIndicator={false}
      >
        <Card tint="muted" style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          {rows.map((row, index) => (
            <View key={row.label} style={[styles.row, index === rows.length - 1 && styles.rowLast]}>
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
    card: {
      paddingVertical: 0,
      paddingHorizontal: spacing.md,
      marginBottom: spacing.md,
    },
    title: {
      fontSize: 22,
      fontWeight: '800',
      color: colors.text,
      paddingTop: spacing.md,
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
  });
}
