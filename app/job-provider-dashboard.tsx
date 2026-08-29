import { useEffect, useMemo, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, ScrollView, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { spacing } from '../theme/spacing';
import type { ThemeColors } from '../theme/colors';
import { StatCard } from '../components/StatCard';
import { Badge } from '../components/Badge';
import { SidebarMenu } from '../components/SidebarMenu';
import { BottomNavBar } from '../components/BottomNavBar';
import { getJobProviderDashboard, type JobProviderDashboardResult } from '../services/api';

const HEADER_CONTENT_HEIGHT = 56;

export default function JobProviderDashboard() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const headerHeight = insets.top + HEADER_CONTENT_HEIGHT;
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

  return (
    <>
    <View style={styles.container}>
      <View style={styles.mainArea}>
        <View style={[styles.topBar, { paddingTop: insets.top, height: headerHeight }]}>
          <Pressable onPress={() => setSidebarOpen(true)} hitSlop={10} style={styles.topBarLeft}>
            <Ionicons name="menu" size={26} color={colors.text} />
            <Text style={styles.platformName}>My MediaXchange</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/notifications')} hitSlop={10}>
            <Ionicons name="notifications-outline" size={24} color={colors.text} />
            <View style={styles.notifDot}>
              <Badge variant="dot" tone="red" size={8} />
            </View>
          </Pressable>
        </View>

        <ScrollView
          style={styles.list}
          contentContainerStyle={[styles.content, { paddingTop: headerHeight + spacing.lg }]}
        >
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
        </ScrollView>
      </View>
      <BottomNavBar active="home" vendorId={vendorId} />
    </View>
    <SidebarMenu visible={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    mainArea: {
      flex: 1,
    },
    list: {
      flex: 1,
    },
    topBar: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      backgroundColor: colors.headerOverlay,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    topBarLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    platformName: {
      marginLeft: spacing.sm,
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
    },
    notifDot: {
      position: 'absolute',
      top: -2,
      right: -2,
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
  });
}
