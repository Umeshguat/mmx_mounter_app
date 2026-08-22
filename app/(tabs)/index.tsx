import { useState } from 'react';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { StatCard } from '../../components/StatCard';
import { SidebarMenu } from '../../components/SidebarMenu';
import { useApp } from '../../context/AppContext';
import { currentUser, recentActivity } from '../../data/mockData';

export default function Home() {
  const { vendor } = useApp();
  const insets = useSafeAreaInsets();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.lg }]}
    >
      <View style={styles.topBar}>
        <Pressable onPress={() => setSidebarOpen(true)} hitSlop={10}>
          <Ionicons name="menu" size={26} color={colors.text} />
        </Pressable>
        <Pressable onPress={() => router.push('/notifications')} hitSlop={10}>
          <Ionicons name="notifications-outline" size={24} color={colors.text} />
          <View style={styles.notifDot} />
        </Pressable>
      </View>

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
      </View>

      <Text style={styles.sectionTitle}>Recent</Text>
      {recentActivity.map((item) => (
        <Pressable key={item.id} style={styles.recentRow}>
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
        </Pressable>
      ))}
    </ScrollView>
    <SidebarMenu visible={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  notifDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primaryStart,
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
    backgroundColor: colors.surfaceMuted,
    borderRadius: 14,
    padding: spacing.md,
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
