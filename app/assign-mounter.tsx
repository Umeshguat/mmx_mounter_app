import { useEffect, useMemo, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { radius, spacing } from '../theme/spacing';
import type { ThemeColors } from '../theme/colors';
import { Card } from '../components/Card';
import { Dropdown } from '../components/Dropdown';
import { GradientButton } from '../components/GradientButton';
import { ScreenHeader, useScreenHeaderHeight } from '../components/ScreenHeader';
import { ScreenGradient } from '../components/ScreenGradient';
import { assignMounter, getMounters, getTaskDetail } from '../services/api';
import { capitalizeFirst } from '../utils/format';

const MEDIA_PHOTO_KEYS = ['media_photo', 'photo_url', 'image_url', 'media_image', 'media_photo_url'];

// Same field set as job-provider-task-detail.tsx's read-only view.
const DETAIL_FIELDS: { keys: string[]; label: string; format?: (value: string) => string }[] = [
  { keys: ['campaign_name', 'campaignname'], label: 'Campaign Name', format: capitalizeFirst },
  { keys: ['media_type'], label: 'Media Type' },
  { keys: ['media_name'], label: 'Media Name' },
  { keys: ['media_code'], label: 'Media Code' },
  { keys: ['media_size', 'size'], label: 'Size' },
  { keys: ['quantity'], label: 'Qty' },
  { keys: ['light_type', 'lighting_type'], label: 'Light Type' },
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

export default function AssignMounter() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const headerHeight = useScreenHeaderHeight();

  const { cartId, title, type } = useLocalSearchParams<{
    cartId: string;
    title?: string;
    subtitle?: string;
    type?: string;
  }>();
  const headerTitle = type === 'mounting_removal' ? 'Assign Mounting Removal' : 'Assign Mounter';

  const [task, setTask] = useState<Record<string, any> | null>(null);
  const [taskLoading, setTaskLoading] = useState(true);

  const [mounterOptions, setMounterOptions] = useState<{ id: string; name: string }[]>([]);
  const [mountersError, setMountersError] = useState<string | null>(null);
  const [mounter, setMounter] = useState<{ id: string; name: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getMounters()
      .then((list) => setMounterOptions(list.map((m) => ({ id: String(m.mounterId), name: m.mounterName }))))
      .catch((err) => setMountersError(err instanceof Error ? err.message : 'Could not load mounters.'));
  }, []);

  useEffect(() => {
    if (!cartId) {
      setTaskLoading(false);
      return;
    }
    setTaskLoading(true);
    getTaskDetail(cartId)
      .then(setTask)
      .catch(() => {})
      .finally(() => setTaskLoading(false));
  }, [cartId]);

  const canSubmit = !!cartId && !!mounter;

  const onAssign = async () => {
    if (!canSubmit || !mounter || !cartId) return;
    setSubmitting(true);
    try {
      await assignMounter(cartId, mounter.id);
      Alert.alert('Task assigned', `${title ?? 'This task'} has been assigned to ${mounter.name}.`, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err) {
      Alert.alert('Could not assign mounter', err instanceof Error ? err.message : 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const displayTitle = task?.media_name ?? title ?? `Cart #${cartId}`;
  const mediaPhoto = fieldOf(task, MEDIA_PHOTO_KEYS);
  const detailRows = DETAIL_FIELDS.map(({ keys, label, format }) => {
    const value = fieldOf(task, keys);
    return { label, value: value !== undefined && format ? format(value) : value };
  }).filter((row) => row.value !== undefined);

  return (
    <ScreenGradient style={styles.container}>
      <ScreenHeader title={headerTitle} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: headerHeight + spacing.lg }]}
        keyboardShouldPersistTaps="handled"
      >
      {taskLoading ? (
        <ActivityIndicator color={colors.primaryStart} style={styles.taskLoading} />
      ) : (
        <Card tint="muted" style={styles.mediaCard}>
          {mediaPhoto ? (
            <Image source={{ uri: mediaPhoto }} style={styles.mediaPhoto} resizeMode="cover" />
          ) : (
            <View style={styles.mediaPhotoPlaceholder}>
              <Ionicons name="image-outline" size={32} color={colors.textFaint} />
            </View>
          )}
          <Text style={styles.taskTitle}>{displayTitle}</Text>

          {detailRows.map((row, index) => (
            <View
              key={row.label}
              style={[styles.detailRow, index === detailRows.length - 1 && styles.detailRowLast]}
            >
              <Text style={styles.detailLabel}>{row.label}</Text>
              <Text style={styles.detailValue}>{row.value}</Text>
            </View>
          ))}
        </Card>
      )}

      <Card tint="muted" style={styles.section}>
        <View style={styles.fieldLast}>
          <Text style={styles.fieldLabel}>{headerTitle}</Text>
          <Dropdown
            icon="person-outline"
            placeholder="Select mounter"
            value={mounter}
            options={mounterOptions}
            onSelect={setMounter}
            searchable
          />
          {mountersError ? <Text style={styles.errorText}>{mountersError}</Text> : null}
        </View>
      </Card>

      <GradientButton
        label="Assign Task"
        icon="checkmark"
        onPress={onAssign}
        loading={submitting}
        disabled={!canSubmit}
        style={styles.submitButton}
      />
      </ScrollView>
      </KeyboardAvoidingView>
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
      paddingBottom: spacing.xl,
    },
    taskLoading: {
      marginBottom: spacing.lg,
    },
    mediaCard: {
      marginBottom: spacing.lg,
    },
    mediaPhoto: {
      width: '100%',
      height: 160,
      borderRadius: radius.md,
      backgroundColor: colors.surfaceMuted,
      marginBottom: spacing.md,
    },
    mediaPhotoPlaceholder: {
      width: '100%',
      height: 160,
      borderRadius: radius.md,
      backgroundColor: colors.surfaceMuted,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.md,
    },
    section: {
      marginBottom: spacing.lg,
    },
    taskTitle: {
      fontSize: 19,
      fontWeight: '800',
      color: colors.text,
      marginBottom: spacing.xs,
    },
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      gap: spacing.md,
    },
    detailRowLast: {
      borderBottomWidth: 0,
    },
    detailLabel: {
      fontSize: 13,
      color: colors.textMuted,
    },
    detailValue: {
      flex: 1,
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
      textAlign: 'right',
    },
    fieldLast: {
      marginBottom: 0,
    },
    errorText: {
      marginTop: spacing.xs,
      fontSize: 13,
      color: colors.danger,
    },
    fieldLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.xs,
    },
    submitButton: {
      marginTop: spacing.md,
    },
  });
}
