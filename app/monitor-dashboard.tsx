import { useCallback, useMemo, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { spacing } from '../theme/spacing';
import type { ThemeColors } from '../theme/colors';
import { StatCard } from '../components/StatCard';
import { Badge } from '../components/Badge';
import { SidebarMenu } from '../components/SidebarMenu';
import { BottomNavBar } from '../components/BottomNavBar';
import { ScreenGradient } from '../components/ScreenGradient';
import { useApp } from '../context/AppContext';
import { getMonitorDashboard, getMonitorUploadedPhotos, getMonitorWorklist } from '../services/api';

const HEADER_CONTENT_HEIGHT = 56;

// Both monitorworklist and monitoruploadedphotos take start_date/end_date
// as YYYY-MM-DD (confirmed against the backend's validation error message).
function toApiDate(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// Default range for the Worklist overview tile: far enough back to include
// everything, through today. No pickers on this screen — the Worklist screen
// itself has its own date-range filter for browsing.
const DEFAULT_START_DATE = new Date(2020, 0, 1);

export default function MonitorDashboard() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const headerHeight = insets.top + HEADER_CONTENT_HEIGHT;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { userProfile } = useApp();

  const startDate = DEFAULT_START_DATE;
  const endDate = useMemo(() => new Date(), []);
  const [todayCount, setTodayCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [worklistCount, setWorklistCount] = useState(0);
  const [uploadedPhotoCount, setUploadedPhotoCount] = useState(0);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      setStatsLoading(true);
      setStatsError(null);
      // allSettled, not all — one endpoint failing (e.g. a validation error
      // on a single call) shouldn't blank out every card; show whatever
      // succeeded and surface the error only if everything failed.
      Promise.allSettled([
        getMonitorDashboard(),
        getMonitorWorklist(1, '', toApiDate(startDate), toApiDate(endDate)),
        getMonitorUploadedPhotos(toApiDate(startDate), toApiDate(endDate)),
      ])
        .then(([dashboard, worklist, photos]) => {
          if (dashboard.status === 'fulfilled') {
            setTodayCount(dashboard.value.todayCount);
            setPendingCount(dashboard.value.pendingCount);
          }
          if (worklist.status === 'fulfilled') {
            setWorklistCount(worklist.value.count);
          }
          if (photos.status === 'fulfilled') {
            setUploadedPhotoCount(photos.value.reduce((sum, task) => sum + task.photos.length, 0));
          }
          const firstError = [dashboard, worklist, photos].find(
            (r): r is PromiseRejectedResult => r.status === 'rejected'
          );
          setStatsError(
            dashboard.status === 'rejected' && worklist.status === 'rejected' && photos.status === 'rejected'
              ? firstError?.reason instanceof Error
                ? firstError.reason.message
                : 'Could not load dashboard.'
              : null
          );
        })
        .finally(() => setStatsLoading(false));
    }, [startDate, endDate])
  );

  return (
    <>
      <ScreenGradient style={styles.container}>
        <View style={styles.mainArea}>
          <View style={[styles.topBar, { paddingTop: insets.top, height: headerHeight }]}>
            <Pressable onPress={() => setSidebarOpen(true)} hitSlop={10} style={styles.topBarLeft}>
              <Ionicons name="menu" size={26} color={colors.onBackgroundIcon} />
              <Text style={styles.platformName}>My MediaXchange</Text>
            </Pressable>
            <Pressable onPress={() => router.push('/notifications')} hitSlop={10}>
              <Ionicons name="notifications" size={26} color={colors.onBackgroundIcon} />
              <View style={styles.notifDot}>
                <Badge variant="dot" tone="red" size={8} />
              </View>
            </Pressable>
          </View>

          <ScrollView
            style={styles.list}
            contentContainerStyle={[styles.content, { paddingTop: headerHeight + spacing.lg }]}
          >
            <Text style={styles.greeting}>{userProfile?.name ?? 'Monitor'}</Text>
            <Text style={styles.subGreeting}>Monitor dashboard</Text>

            <Text style={styles.sectionTitle}>Overview</Text>
            {statsLoading ? (
              <ActivityIndicator color={colors.primaryStart} style={styles.statsLoading} />
            ) : statsError ? (
              <Text style={styles.statsError}>{statsError}</Text>
            ) : (
              <View style={styles.statsGrid}>
                <StatCard
                  label="Today"
                  value={todayCount}
                  icon="calendar-outline"
                  background={colors.cardGreen}
                  iconColor={colors.cardGreenIcon}
                  onPress={() =>
                    router.push({
                      pathname: '/monitor-worklist',
                      params: { type: 'today', label: 'Today' },
                    })
                  }
                />
                <StatCard
                  label="Pending"
                  value={pendingCount}
                  icon="hourglass-outline"
                  background={colors.cardOrange}
                  iconColor={colors.cardOrangeIcon}
                  onPress={() =>
                    router.push({
                      pathname: '/monitor-worklist',
                      params: { type: 'pending', label: 'Pending' },
                    })
                  }
                />
                <StatCard
                  label="Worklist"
                  value={worklistCount}
                  icon="list-outline"
                  background={colors.cardBlue}
                  iconColor={colors.cardBlueIcon}
                  onPress={() =>
                    router.push({
                      pathname: '/monitor-worklist',
                      params: { startDate: toApiDate(startDate), endDate: toApiDate(endDate) },
                    })
                  }
                />
                <StatCard
                  label="Uploaded Photos"
                  value={uploadedPhotoCount}
                  icon="images-outline"
                  background={colors.cardGreen}
                  iconColor={colors.cardGreenIcon}
                  onPress={() => router.push('/monitor-uploaded-photos')}
                />
              </View>
            )}
          </ScrollView>
        </View>
        <BottomNavBar active="home" variant="monitor" />
      </ScreenGradient>
      <SidebarMenu visible={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'transparent',
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
      backgroundColor: 'transparent',
    },
    topBarLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    platformName: {
      marginLeft: spacing.sm,
      fontSize: 15,
      fontWeight: '700',
      color: colors.onBackground,
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
      color: colors.onBackground,
    },
    subGreeting: {
      marginTop: 2,
      fontSize: 15,
      color: colors.onBackgroundMuted,
      marginBottom: spacing.lg,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.onBackground,
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
      color: colors.onBackground,
      marginBottom: spacing.md,
    },
  });
}
