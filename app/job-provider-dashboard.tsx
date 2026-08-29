import { useEffect, useMemo, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { spacing } from '../theme/spacing';
import type { ThemeColors } from '../theme/colors';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { GradientButton } from '../components/GradientButton';
import { ScreenHeader, useScreenHeaderHeight } from '../components/ScreenHeader';
import { useAssignments } from '../context/AssignmentContext';
import { getJobProviderDashboard, type JobProviderDashboardResult } from '../services/api';
import type { TaskAssignment } from '../data/mockData';

export default function JobProviderDashboard() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const headerHeight = useScreenHeaderHeight();
  const { assignments, setStatus } = useAssignments();
  const { vendorId, vendorName } = useLocalSearchParams<{ vendorId?: string; vendorName?: string }>();

  const [stats, setStats] = useState<JobProviderDashboardResult | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  useEffect(() => {
    if (!vendorId) return;
    setStatsLoading(true);
    setStatsError(null);
    getJobProviderDashboard(vendorId)
      .then(setStats)
      .catch((error) => setStatsError(error instanceof Error ? error.message : 'Could not load dashboard.'))
      .finally(() => setStatsLoading(false));
  }, [vendorId]);

  const completedCount = assignments.filter((a) => a.status === 'completed').length;
  const pendingCount = assignments.length - completedCount;

  const onToggle = (item: TaskAssignment) => {
    setStatus(item.id, item.status === 'completed' ? 'pending' : 'completed');
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Job Provider" />

      <FlatList
        data={assignments}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.content, { paddingTop: headerHeight + spacing.lg }]}
        ListHeaderComponent={
          <>
            {vendorName ? <Text style={styles.vendorName}>{vendorName}</Text> : null}

            {statsLoading ? (
              <ActivityIndicator color={colors.primaryStart} style={styles.statsLoading} />
            ) : statsError ? (
              <Text style={styles.statsError}>{statsError}</Text>
            ) : stats ? (
              <View style={styles.statsGrid}>
                <Card tint="muted" style={styles.statCard}>
                  <Text style={styles.statValue}>{stats.mountingWorklistCount}</Text>
                  <Text style={styles.statLabel}>Mounting Worklist</Text>
                </Card>
                <Card tint="muted" style={styles.statCard}>
                  <Text style={styles.statValue}>{stats.mountingRemovalCount}</Text>
                  <Text style={styles.statLabel}>Mounting Removal</Text>
                </Card>
                <Card tint="muted" style={styles.statCard}>
                  <Text style={styles.statValue}>{stats.mounterAssignedCount}</Text>
                  <Text style={styles.statLabel}>Mounter Assigned</Text>
                </Card>
              </View>
            ) : null}

            <View style={styles.summaryRow}>
              <Card tint="muted" style={styles.summaryCard}>
                <Text style={styles.summaryValue}>{pendingCount}</Text>
                <Text style={styles.summaryLabel}>Pending</Text>
              </Card>
              <Card tint="muted" style={styles.summaryCard}>
                <Text style={styles.summaryValue}>{completedCount}</Text>
                <Text style={styles.summaryLabel}>Completed</Text>
              </Card>
            </View>

            <GradientButton
              label="Assign New Task"
              icon="person-add"
              onPress={() => router.push('/assign-mounter')}
              style={styles.assignButton}
            />

            <Text style={styles.sectionTitle}>Assigned Tasks</Text>
          </>
        }
        renderItem={({ item }) => (
          <Pressable onPress={() => onToggle(item)}>
            <Card tint="surface" style={styles.row}>
              <View style={styles.rowIcon}>
                <Ionicons name="person-outline" size={20} color={colors.primaryStart} />
              </View>
              <View style={styles.rowInfo}>
                <Text style={styles.rowTitle}>{item.campaignName}</Text>
                <Text style={styles.rowSubtitle}>
                  {item.mounterName}
                  {item.location ? ` · ${item.location}` : ''}
                </Text>
                <Text style={styles.rowDate}>{item.assignedDate}</Text>
              </View>
              <Badge
                label={item.status === 'completed' ? 'Completed' : 'Pending'}
                tone={item.status === 'completed' ? 'green' : 'orange'}
              />
            </Card>
          </Pressable>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No tasks assigned yet. Tap "Assign New Task" to get started.</Text>
        }
      />
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
    vendorName: {
      fontSize: 24,
      fontWeight: '800',
      color: colors.text,
      marginBottom: spacing.lg,
    },
    statsLoading: {
      marginBottom: spacing.lg,
    },
    statsError: {
      fontSize: 14,
      color: colors.danger,
      marginBottom: spacing.lg,
    },
    statsGrid: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginBottom: spacing.lg,
    },
    statCard: {
      flex: 1,
      alignItems: 'center',
    },
    statValue: {
      fontSize: 22,
      fontWeight: '800',
      color: colors.text,
    },
    statLabel: {
      marginTop: spacing.xs,
      fontSize: 12,
      color: colors.textMuted,
      textAlign: 'center',
    },
    summaryRow: {
      flexDirection: 'row',
      gap: spacing.md,
      marginBottom: spacing.lg,
    },
    summaryCard: {
      flex: 1,
      alignItems: 'center',
    },
    summaryValue: {
      fontSize: 26,
      fontWeight: '800',
      color: colors.text,
    },
    summaryLabel: {
      marginTop: spacing.xs,
      fontSize: 13,
      color: colors.textMuted,
    },
    assignButton: {
      marginBottom: spacing.lg,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: spacing.md,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    rowIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.cardBlue,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.md,
    },
    rowInfo: {
      flex: 1,
    },
    rowTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
    },
    rowSubtitle: {
      marginTop: 2,
      fontSize: 13,
      color: colors.textMuted,
    },
    rowDate: {
      marginTop: 2,
      fontSize: 12,
      color: colors.textFaint,
    },
    emptyText: {
      textAlign: 'center',
      fontSize: 14,
      color: colors.textMuted,
      marginTop: spacing.xl,
    },
  });
}
