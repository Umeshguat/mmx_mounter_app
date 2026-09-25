import { useEffect, useMemo, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { radius, spacing } from '../theme/spacing';
import type { ThemeColors } from '../theme/colors';
import { Card } from '../components/Card';
import { ScreenHeader, useScreenHeaderHeight } from '../components/ScreenHeader';
import { ScreenGradient } from '../components/ScreenGradient';
import { getTaskDetail } from '../services/api';

const MEDIA_PHOTO_KEYS = ['media_photo', 'photo_url', 'image_url', 'media_image', 'media_photo_url'];

// Everything shown in the dedicated rows below, in this exact order —
// campaign name, media type, media name, size, qty, light type, plus the
// identifying/scheduling fields a job provider cares about when reviewing
// a task (no remarks/photo-upload UI here, this is read-only).
const DETAIL_FIELDS: { keys: string[]; label: string }[] = [
  { keys: ['campaign_name', 'campaignname'], label: 'Campaign Name' },
  { keys: ['media_type'], label: 'Media Type' },
  { keys: ['media_name'], label: 'Media Name' },
  { keys: ['media_code'], label: 'Media Code' },
  { keys: ['media_size', 'size'], label: 'Size' },
  { keys: ['quantity'], label: 'Qty' },
  { keys: ['light_type', 'lighting_type'], label: 'Light Type' },
  { keys: ['order_number'], label: 'Order Number' },
  { keys: ['start_date'], label: 'Start Date' },
  { keys: ['end_date'], label: 'End Date' },
  { keys: ['mounter_name'], label: 'Mounter' },
];

function fieldOf(task: Record<string, any> | null, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = task?.[key];
    if (value !== undefined && value !== null && value !== '') return String(value);
  }
  return undefined;
}

export default function JobProviderTaskDetail() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const headerHeight = useScreenHeaderHeight();
  const { cartId } = useLocalSearchParams<{ cartId: string }>();

  const [task, setTask] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!cartId) return;
    setLoading(true);
    setError(null);
    getTaskDetail(cartId)
      .then(setTask)
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load task details.'))
      .finally(() => setLoading(false));
  }, [cartId]);

  const title = task?.media_name ?? 'Task Detail';
  const mediaPhoto = fieldOf(task, MEDIA_PHOTO_KEYS);
  const rows = DETAIL_FIELDS.map(({ keys, label }) => ({ label, value: fieldOf(task, keys) })).filter(
    (row) => row.value !== undefined
  );

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
          </Card>

          <Card tint="muted" style={styles.card}>
            {rows.map((row, index) => (
              <View key={row.label} style={[styles.row, index === rows.length - 1 && styles.rowLast]}>
                <Text style={styles.label}>{row.label}</Text>
                <Text style={styles.value}>{row.value}</Text>
              </View>
            ))}
          </Card>
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
    card: {
      paddingVertical: 0,
      paddingHorizontal: spacing.md,
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
