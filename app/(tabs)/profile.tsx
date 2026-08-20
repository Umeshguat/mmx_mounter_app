import { router } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';
import { useApp } from '../../context/AppContext';
import { currentUser } from '../../data/mockData';

type MenuItem = {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  danger?: boolean;
  onPress: () => void;
};

export default function Profile() {
  const { logout } = useApp();

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
    { id: 'notif', label: 'Notification', icon: 'notifications-outline', onPress: () => {} },
    { id: 'help', label: 'Help & Support', icon: 'help-circle-outline', onPress: () => {} },
    { id: 'rate', label: 'Rate Us', icon: 'star-outline', onPress: () => {} },
    { id: 'about', label: 'About MMX', icon: 'play-outline', onPress: () => {} },
    { id: 'logout', label: 'Logout', icon: 'power-outline', danger: true, onPress: onLogout },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.topBar}>
        <Ionicons name="menu" size={26} color={colors.text} />
      </View>

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

      <View style={styles.menu}>
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
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  topBar: {
    marginBottom: spacing.lg,
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
  menu: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuRowLast: {
    borderBottomWidth: 0,
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
