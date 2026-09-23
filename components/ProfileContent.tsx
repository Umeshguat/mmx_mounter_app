import { useMemo, useState } from 'react';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Alert, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useSettings } from '../context/SettingsContext';
import { spacing } from '../theme/spacing';
import type { ThemeColors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { RateUsModal } from './RateUsModal';
import { Card } from './Card';

// Same coral-to-red gradient as the login page's card.
const AVATAR_GRADIENT = ['#F68D7E', '#DB4438'] as const;

type MenuItem = {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  danger?: boolean;
  onPress: () => void;
};

// Shared between the mounter's (tabs)/profile.tsx and the standalone
// job-provider-profile.tsx — pulled out so job-provider navigation never has
// to route through the (tabs) group (which would surface the mounter tab bar).
export function ProfileContent() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { logout, userProfile } = useApp();
  const { geotagPhotos, setGeotagPhotos } = useSettings();
  const [rateModalVisible, setRateModalVisible] = useState(false);

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
    <>
      <Text style={styles.title}>Profile</Text>

      <View style={styles.avatarWrap}>
        <LinearGradient colors={AVATAR_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.avatar}>
          <Ionicons name="person" size={56} color={colors.white} />
        </LinearGradient>
        <View style={styles.verifiedBadge}>
          <Ionicons name="checkmark" size={14} color={colors.white} />
        </View>
      </View>
      <View style={styles.nameBlock}>
        <Text style={styles.name}>{userProfile?.name ?? 'User'}</Text>
        {userProfile?.mobile ? <Text style={styles.mobile}>{userProfile.mobile}</Text> : null}
      </View>

      <Card tint="surface" padding={0} style={styles.menuCard}>
        <View style={styles.menuRow}>
          <Ionicons name="location-outline" size={22} color={colors.text} />
          <Text style={styles.menuLabel}>Geotag Photos</Text>
          <Switch
            value={geotagPhotos}
            onValueChange={setGeotagPhotos}
            trackColor={{ false: colors.border, true: colors.primaryStart }}
            thumbColor={colors.white}
          />
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
    </>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    title: {
      fontSize: 30,
      fontWeight: '800',
      color: colors.onBackground,
      marginBottom: spacing.lg,
    },
    avatarWrap: {
      alignSelf: 'center',
    },
    avatar: {
      width: 116,
      height: 116,
      borderRadius: 58,
      alignItems: 'center',
      justifyContent: 'center',
    },
    verifiedBadge: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.success,
      borderWidth: 2,
      borderColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
    },
    nameBlock: {
      alignItems: 'center',
      marginTop: spacing.md,
      marginBottom: spacing.lg,
    },
    name: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.onBackground,
    },
    mobile: {
      marginTop: 2,
      fontSize: 14,
      color: colors.onBackgroundMuted,
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
    menuLabel: {
      flex: 1,
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
