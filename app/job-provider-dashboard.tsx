import { useEffect, useMemo, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { spacing } from '../theme/spacing';
import type { ThemeColors } from '../theme/colors';
import { Card } from '../components/Card';
import { StatCard } from '../components/StatCard';
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
            <Text style={styles.greeting}>{vendorName ?? 'Vendor'}</Text>
            <Text style={styles.subGreeting}>Job provider dashboard</Text>

            <Text style={styles.sectionTitle}>Overview</Text>
            {statsLoading ? (
              <ActivityIndicator color={colors.primaryStart} style={styles.statsLoading} />
            ) : statsError ? (
              <Text style={styles.statsError}>{statsError}</Text>
            ) : (
              <View style={styles.statsGrid}>
                <StatCard
                  label="Mounting Worklist"
                  value={stats?.mountingWorklistCount ?? 0}
                  icon="list-outline"
                  background={colors.cardBlue}
                  iconColor={colors.cardBlueIcon}
                  onPress={() =>
                    router.push({
                      pathname: '/job-provider-worklist',
                      params: { type: 'mounting_worklist', vendorId, label: 'Mounting Worklist' },
                    })
                  }
                />
                <StatCard
                  label="Mounting Removal"
                  value={stats?.mountingRemovalCount ?? 0}
                  icon="desktop-outline"
                  background={colors.cardOrange}
                  iconColor={colors.cardOrangeIcon}
                  onPress={() =>
                    router.push({
                      pathname: '/job-provider-worklist',
                      params: { type: 'mounting_removal', vendorId, label: 'Mounting Removal' },
                    })
                  }
                />
                <StatCard
                  label="Mounter Assigned"
                  value={stats?.mounterAssignedCount ?? 0}
                  icon="person-outline"
                  background={colors.cardGreen}
                  iconColor={colors.cardGreenIcon}
                  onPress={() =>
                    router.push({
                      pathname: '/job-provider-worklist',
                      params: { type: 'mounter_assigned', vendorId, label: 'Mounter Assigned' },
                    })
                  }
                />
              </View>
            )}

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
            <Card tint="muted" style={styles.row}>
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
    greeting: {
      fontSize: 30,
      fontWeight: '800',
      color: colors.text,
    },
    subGreeting: {
      marginTop: 2,
      fontSize: 15,
      color: colors.textMuted,
      marginBottom: spacing.lg,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: spacing.md,
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: spacing.md,
    },
    statsLoading: {
      marginBottom: spacing.md,
    },
    statsError: {
      fontSize: 14,
      color: colors.danger,
      marginBottom: spacing.md,
    },
    assignButton: {
      marginBottom: spacing.lg,
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
