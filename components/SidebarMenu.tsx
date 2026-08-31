import { useEffect, useMemo, useRef, useState } from 'react';
import { router } from 'expo-router';
import { Alert, Animated, Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { spacing } from '../theme/spacing';
import type { ThemeColors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { RateUsModal } from './RateUsModal';
import { MmxWordmark, WORDMARK_ALLOCATED_HEIGHT } from './MmxWordmark';
import { ToggleSwitch } from './ToggleSwitch';

type MenuItem = {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  danger?: boolean;
  onPress: () => void;
};

const PANEL_WIDTH = Math.min(300, Dimensions.get('window').width * 0.8);

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function SidebarMenu({ visible, onClose }: Props) {
  const { colors, isDark, toggleTheme } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { logout, vendor, userProfile } = useApp();
  const [rateModalVisible, setRateModalVisible] = useState(false);
  const translateX = useRef(new Animated.Value(-PANEL_WIDTH)).current;

  useEffect(() => {
    if (visible) {
      translateX.setValue(-PANEL_WIDTH);
      Animated.timing(translateX, { toValue: 0, duration: 220, useNativeDriver: true }).start();
    }
  }, [visible, translateX]);

  const go = (path: Parameters<typeof router.push>[0]) => {
    onClose();
    router.push(path);
  };

  const onLogout = () => {
    onClose();
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
    { id: 'notif', label: 'Notification', icon: 'notifications-outline', onPress: () => go('/notifications') },
    { id: 'help', label: 'Help & Support', icon: 'help-circle-outline', onPress: () => go('/help-support') },
    {
      id: 'rate',
      label: 'Rate Us',
      icon: 'star-outline',
      onPress: () => {
        onClose();
        setRateModalVisible(true);
      },
    },
    { id: 'about', label: 'About MMX', icon: 'play-outline', onPress: () => go('/about') },
    { id: 'logout', label: 'Logout', icon: 'power-outline', danger: true, onPress: onLogout },
  ];

  if (!visible) {
    return <RateUsModal visible={rateModalVisible} onClose={() => setRateModalVisible(false)} />;
  }

  return (
    <>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <Animated.View style={[styles.panel, { transform: [{ translateX }] }]}>
          <View style={styles.header}>
            <View style={styles.logoWrap}>
              <MmxWordmark size="sm" />
            </View>

            <View style={styles.avatarWrap}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={32} color={colors.primaryStart} />
              </View>
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark" size={10} color={colors.white} />
              </View>
            </View>
            <Text style={styles.name}>{userProfile?.name ?? 'User'}</Text>
            {userProfile?.mobile ? <Text style={styles.vendorName}>{userProfile.mobile}</Text> : null}
            {vendor ? <Text style={styles.vendorName}>{vendor.name}</Text> : null}
          </View>

          <View style={styles.themeRow}>
            <View style={styles.themeRowLeft}>
              <Ionicons name={isDark ? 'moon' : 'sunny'} size={20} color={colors.text} />
              <Text style={styles.themeLabel}>Dark Mode</Text>
            </View>
            <ToggleSwitch value={isDark} onValueChange={toggleTheme} />
          </View>

          <View style={styles.menu}>
            {items.map((item) => (
              <Pressable key={item.id} style={styles.menuRow} onPress={item.onPress}>
                <Ionicons name={item.icon} size={20} color={item.danger ? colors.danger : colors.text} />
                <Text style={[styles.menuLabel, item.danger && styles.menuLabelDanger]}>{item.label}</Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>
      </View>

      <RateUsModal visible={rateModalVisible} onClose={() => setRateModalVisible(false)} />
    </>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      flexDirection: 'row',
      zIndex: 100,
    },
    backdrop: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: colors.overlay,
    },
    panel: {
      width: PANEL_WIDTH,
      height: '100%',
      backgroundColor: colors.background,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.xxl,
      shadowColor: colors.shadow,
      shadowOffset: { width: 2, height: 0 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 12,
    },
    header: {
      marginBottom: spacing.lg,
    },
    logoWrap: {
      height: WORDMARK_ALLOCATED_HEIGHT.sm,
      justifyContent: 'center',
    },
    avatarWrap: {
      alignSelf: 'flex-start',
      marginTop: spacing.lg,
    },
    avatar: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.cardBlue,
      alignItems: 'center',
      justifyContent: 'center',
    },
    verifiedBadge: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: colors.success,
      borderWidth: 2,
      borderColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
    },
    name: {
      marginTop: spacing.sm,
      fontSize: 17,
      fontWeight: '700',
      color: colors.text,
    },
    vendorName: {
      marginTop: 2,
      fontSize: 13,
      color: colors.textMuted,
    },
    themeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.md,
      marginBottom: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    themeRowLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    themeLabel: {
      marginLeft: spacing.md,
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
    },
    menu: {
      borderTopWidth: 0,
    },
    menuRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    menuLabel: {
      marginLeft: spacing.md,
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
    },
    menuLabelDanger: {
      color: colors.danger,
    },
  });
}
