import { useMemo, useState } from 'react';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { spacing } from '../../theme/spacing';
import type { ThemeColors } from '../../theme/colors';
import { StatCard } from '../../components/StatCard';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { SidebarMenu } from '../../components/SidebarMenu';
import { useApp } from '../../context/AppContext';
import { currentUser, recentActivity } from '../../data/mockData';

const HEADER_CONTENT_HEIGHT = 56;

export default function Home() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { vendor } = useApp();
  const insets = useSafeAreaInsets();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const headerHeight = insets.top + HEADER_CONTENT_HEIGHT;

  return (
    <>
    <View style={styles.container}>
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
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingTop: headerHeight + spacing.lg }]}
      >
      <Text style={styles.greeting}>Hello, {currentUser.firstName} !</Text>
      <Text style={styles.subGreeting}>
        Welcome back{vendor ? ` · ${vendor.name}` : ''}
      </Text>

      <Text style={styles.sectionTitle}>My Task</Text>
      <View style={styles.statsGrid}>
        <StatCard
          label="Today's Work"
          value={20}
          icon="calendar-outline"
          background={colors.cardGreen}
          iconColor={colors.cardGreenIcon}
          onPress={() => router.push('/(tabs)/tasks')}
        />
        <StatCard
          label="Pending Work"
          value={6}
          icon="albums-outline"
          background={colors.cardBlue}
          iconColor={colors.cardBlueIcon}
          onPress={() => router.push('/(tabs)/tasks')}
        />
        <StatCard
          label="Mounting Removal"
          value={3}
          icon="desktop-outline"
          background={colors.cardOrange}
          iconColor={colors.cardOrangeIcon}
        />
        <StatCard
          label="Pending Mounting Removal"
          value={0}
          icon="alert-circle-outline"
          background={colors.cardRed}
          iconColor={colors.cardRedIcon}
        />
        <StatCard
          label="Advance Work"
          value={4}
          icon="time-outline"
          background={colors.cardPurple}
          iconColor={colors.cardPurpleIcon}
          onPress={() => router.push('/(tabs)/tasks')}
        />
      </View>

      <Text style={styles.sectionTitle}>Recent</Text>
      {recentActivity.map((item) => (
        <Pressable key={item.id}>
          <Card tint="muted" style={styles.recentRow}>
            <View
              style={[
                styles.recentIcon,
                { backgroundColor: item.color === 'green' ? colors.cardGreenIcon : colors.cardOrangeIcon },
              ]}
            >
              <Ionicons name={item.icon === 'calendar' ? 'calendar' : 'desktop'} size={20} color={colors.white} />
            </View>
            <View style={styles.recentInfo}>
              <Text style={styles.recentTitle}>{item.title}</Text>
              <Text style={styles.recentDate}>{item.date}</Text>
            </View>
          </Card>
        </Pressable>
      ))}
      </ScrollView>
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
    scroll: {
      flex: 1,
    },
    content: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.xl,
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
    recentRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    recentIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.md,
    },
    recentInfo: {
      flex: 1,
    },
    recentTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
    },
    recentDate: {
      marginTop: 2,
      fontSize: 13,
      color: colors.textMuted,
    },
  });
}
