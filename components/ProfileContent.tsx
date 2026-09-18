import { useMemo, useState } from 'react';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { radius, spacing } from '../theme/spacing';
import { gradients } from '../theme/colors';
import type { ThemeColors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { RateUsModal } from './RateUsModal';
import { Card } from './Card';

type MenuItem = {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  iconColor: string;
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

  const accountItems: MenuItem[] = [
    {
      id: 'notif',
      label: 'Notification',
      icon: 'notifications-outline',
      iconBg: colors.cardBlue,
      iconColor: colors.cardBlueIcon,
      onPress: () => router.push('/notifications'),
    },
    {
      id: 'help',
      label: 'Help & Support',
      icon: 'help-circle-outline',
      iconBg: colors.cardGreen,
      iconColor: colors.cardGreenIcon,
      onPress: () => router.push('/help-support'),
    },
  ];

  const settingItems: MenuItem[] = [
    {
      id: 'rate',
      label: 'Rate Us',
      icon: 'star-outline',
      iconBg: colors.cardOrange,
      iconColor: colors.cardOrangeIcon,
      onPress: () => setRateModalVisible(true),
    },
    {
      id: 'about',
      label: 'About MMX',
      icon: 'play-outline',
      iconBg: colors.cardPurple,
      iconColor: colors.cardPurpleIcon,
      onPress: () => router.push('/about'),
    },
    {
      id: 'logout',
      label: 'Logout',
      icon: 'power-outline',
      iconBg: colors.cardRed,
      iconColor: colors.cardRedIcon,
      danger: true,
      onPress: onLogout,
    },
  ];

  const renderRow = (item: MenuItem, index: number, total: number) => (
    <Pressable
      key={item.id}
      style={[styles.menuRow, index === total - 1 && styles.menuRowLast]}
      onPress={item.onPress}
    >
      <View style={[styles.menuIconBadge, { backgroundColor: item.iconBg }]}>
        <Ionicons name={item.icon} size={18} color={item.danger ? colors.danger : item.iconColor} />
      </View>
      <Text style={[styles.menuLabel, item.danger && styles.menuLabelDanger]}>{item.label}</Text>
      <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
    </Pressable>
  );

  return (
    <>
      <View style={styles.headerWrap}>
        <LinearGradient
          colors={gradients.background}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerCard}
        />
        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={36} color={colors.primaryStart} />
          </View>
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark" size={11} color={colors.white} />
          </View>
        </View>
      </View>

      <View style={styles.nameRow}>
        <View style={styles.nameBlock}>
          <Text style={styles.name}>{userProfile?.name ?? 'User'}</Text>
          {userProfile?.mobile ? <Text style={styles.mobile}>{userProfile.mobile}</Text> : null}
        </View>
      </View>

      <Text style={styles.sectionLabel}>Account</Text>
      <Card tint="surface" padding={0} style={styles.menuCard}>
        {accountItems.map((item, index) => renderRow(item, index, accountItems.length))}
      </Card>

      <Text style={styles.sectionLabel}>Setting</Text>
      <Card tint="surface" padding={0} style={styles.menuCard}>
        {settingItems.map((item, index) => renderRow(item, index, settingItems.length))}
      </Card>

      <RateUsModal visible={rateModalVisible} onClose={() => setRateModalVisible(false)} />
    </>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    headerWrap: {
      alignItems: 'center',
    },
    headerCard: {
      width: '100%',
      height: 120,
      borderRadius: radius.lg,
    },
    avatarWrap: {
      position: 'absolute',
      bottom: -36,
      alignSelf: 'center',
    },
    avatar: {
      width: 84,
      height: 84,
      borderRadius: 42,
      backgroundColor: colors.white,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 3,
      borderColor: colors.white,
    },
    verifiedBadge: {
      position: 'absolute',
      bottom: 2,
      right: 2,
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: colors.success,
      borderWidth: 2,
      borderColor: colors.white,
      alignItems: 'center',
      justifyContent: 'center',
    },
    nameRow: {
      alignItems: 'center',
      marginTop: 44,
      marginBottom: spacing.lg,
    },
    nameBlock: {
      alignItems: 'center',
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
    sectionLabel: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.onBackground,
      marginBottom: spacing.sm,
      marginTop: spacing.md,
    },
    menuCard: {
      overflow: 'hidden',
      marginBottom: spacing.md,
    },
    menuRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    menuRowLast: {
      borderBottomWidth: 0,
    },
    menuIconBadge: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.md,
    },
    menuLabel: {
      flex: 1,
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
    },
    menuLabelDanger: {
      color: colors.danger,
    },
  });
}
