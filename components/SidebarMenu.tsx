import { useEffect, useRef, useState } from 'react';
import { router } from 'expo-router';
import { Alert, Animated, Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { useApp } from '../context/AppContext';
import { currentUser } from '../data/mockData';
import { RateUsModal } from './RateUsModal';

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
  const { logout, vendor } = useApp();
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
            <View style={styles.avatarWrap}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={32} color={colors.primaryStart} />
              </View>
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark" size={10} color={colors.white} />
              </View>
            </View>
            <Text style={styles.name}>{currentUser.name}</Text>
            {vendor ? <Text style={styles.vendorName}>{vendor.name}</Text> : null}
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

const styles = StyleSheet.create({
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
    backgroundColor: 'rgba(20,24,40,0.4)',
  },
  panel: {
    width: PANEL_WIDTH,
    height: '100%',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 12,
  },
  header: {
    marginBottom: spacing.xl,
  },
  avatarWrap: {
    alignSelf: 'flex-start',
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
  menu: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
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
