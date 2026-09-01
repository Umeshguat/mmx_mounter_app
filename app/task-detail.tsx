import { useEffect, useMemo, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { spacing } from '../theme/spacing';
import type { ThemeColors } from '../theme/colors';
import { Card } from '../components/Card';
import { GradientButton } from '../components/GradientButton';
import { ScreenHeader, useScreenHeaderHeight } from '../components/ScreenHeader';
import { getTaskDetail } from '../services/api';

const META_KEYS = new Set(['error', 'errorcode']);

const LABEL_OVERRIDES: Record<string, string> = {
  cart_id: 'Cart ID',
  order_number: 'Order Number',
  media_name: 'Media Name',
  media_code: 'Media Code',
  media_type: 'Media Type',
  cart_status: 'Status',
  start_date: 'Start Date',
  end_date: 'End Date',
  mounter_name: 'Mounter',
  added_on: 'Added On',
  campaign_id: 'Campaign ID',
  media_id: 'Media ID',
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

  const rows = task
    ? Object.entries(task).filter(([key, value]) => !META_KEYS.has(key) && value !== null && value !== '')
    : [];
  const title = task?.media_name ?? task?.title ?? 'Task Detail';

  return (
    <View style={styles.container}>
      <ScreenHeader title="Task Detail" />

      {loading ? (
        <ActivityIndicator
          color={colors.primaryStart}
          style={[styles.loading, { marginTop: headerHeight + spacing.lg }]}
        />
      ) : error ? (
        <Text style={[styles.errorText, { marginTop: headerHeight + spacing.lg }]}>{error}</Text>
      ) : (
        <ScrollView contentContainerStyle={[styles.content, { paddingTop: headerHeight + spacing.lg }]}>
          <Text style={styles.title}>{title}</Text>

          <Card tint="muted" style={styles.card}>
            {rows.map(([key, value], index) => (
              <View key={key} style={[styles.row, index === rows.length - 1 && styles.rowLast]}>
                <Text style={styles.label}>{humanizeKey(key)}</Text>
                <Text style={styles.value}>{String(value)}</Text>
              </View>
            ))}
          </Card>

          <GradientButton
            label="Complete Task"
            icon="camera"
            onPress={() => router.push({ pathname: '/task-form', params: { cartId, type } })}
            style={styles.completeButton}
          />
        </ScrollView>
      )}
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.xl,
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
      color: colors.text,
      marginBottom: spacing.lg,
    },
    card: {
      paddingVertical: 0,
      paddingHorizontal: spacing.md,
    },
    completeButton: {
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
