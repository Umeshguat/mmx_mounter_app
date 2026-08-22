import { useMemo, useState } from 'react';
import { router } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { spacing } from '../../theme/spacing';
import type { ThemeColors } from '../../theme/colors';
import { useApp } from '../../context/AppContext';
import { currentUser } from '../../data/mockData';
import { RateUsModal } from '../../components/RateUsModal';
import { Card } from '../../components/Card';
import { ToggleSwitch } from '../../components/ToggleSwitch';

type MenuItem = {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  danger?: boolean;
  onPress: () => void;
};

export default function Profile() {
  const { colors, isDark, toggleTheme } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { logout } = useApp();
  const [rateModalVisible, setRateModalVisible] = useState(false);
  const insets = useSafeAreaInsets();

  const onLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/login');
        },
      },
    ]);
  };

  const items: MenuItem[] = [
    { id: 'notif', label: 'Notification', icon: 'notifications-outline', onPress: () => router.push('/notifications') },
    { id: 'help', label: 'Help & Support', icon: 'help-circle-outline', onPress: () => router.push('/help-support') },
    { id: 'rate', label: 'Rate Us', icon: 'star-outline', onPress: () => setRateModalVisible(true) },
    { id: 'about', label: 'About MMX', icon: 'play-outline', onPress: () => router.push('/about') },
    { id: 'logout', label: 'Logout', icon: 'power-outline', danger: true, onPress: onLogout },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.lg }]}
    >
      <Text style={styles.title}>Profile</Text>

      <View style={styles.avatarWrap}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={40} color={colors.primaryStart} />
        </View>
        <View style={styles.verifiedBadge}>
          <Ionicons name="checkmark" size={12} color={colors.white} />
        </View>
      </View>
      <Text style={styles.name}>{currentUser.name}</Text>

      <Card tint="surface" padding={0} style={styles.menuCard}>
        <View style={[styles.menuRow, styles.themeRow]}>
          <View style={styles.menuRowLeft}>
            <Ionicons name={isDark ? 'moon' : 'sunny'} size={22} color={colors.text} />
            <Text style={styles.menuLabel}>Dark Mode</Text>
          </View>
          <ToggleSwitch value={isDark} onValueChange={toggleTheme} />
        </View>

        {items.map((item, index) => (
          <Pressable
            key={item.id}
            style={[styles.menuRow, index === items.length - 1 && styles.menuRowLast]}
            onPress={item.onPress}
          >
            <Ionicons name={item.icon} size={22} color={item.danger ? colors.danger : colors.text} />
            <Text style={[styles.menuLabel, item.danger && styles.menuLabelDanger]}>{item.label}</Text>
          </Pressable>
        ))}
      </Card>

      <RateUsModal visible={rateModalVisible} onClose={() => setRateModalVisible(false)} />
    </ScrollView>
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
    title: {
      fontSize: 30,
      fontWeight: '800',
      color: colors.text,
      marginBottom: spacing.lg,
    },
    avatarWrap: {
      alignSelf: 'flex-start',
    },
    avatar: {
      width: 84,
      height: 84,
      borderRadius: 42,
      backgroundColor: colors.cardBlue,
      alignItems: 'center',
      justifyContent: 'center',
    },
    verifiedBadge: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: colors.success,
      borderWidth: 2,
      borderColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
    },
    name: {
      marginTop: spacing.md,
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      marginBottom: spacing.lg,
    },
    menuCard: {
      overflow: 'hidden',
    },
    menuRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.lg,
      paddingHorizontal: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    menuRowLast: {
      borderBottomWidth: 0,
    },
    themeRow: {
      justifyContent: 'space-between',
    },
    menuRowLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    menuLabel: {
      marginLeft: spacing.md,
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    menuLabelDanger: {
      color: colors.danger,
    },
  });
}
