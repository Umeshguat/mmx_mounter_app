import { useMemo } from 'react';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import type { ThemeColors } from '../theme/colors';

// Mirrors (tabs)/_layout.tsx's tab bar look for screens that live outside
// the mounter tab group (e.g. job-provider-dashboard) — same icon set, no
// centered "add" button since job-provider flows don't have a quick-add task.
type NavId = 'home' | 'assignList' | 'summary' | 'profile';

const ITEMS: { id: NavId; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'home', icon: 'home-outline' },
  { id: 'assignList', icon: 'people-outline' },
  { id: 'summary', icon: 'document-text-outline' },
  { id: 'profile', icon: 'person-outline' },
];

type Props = {
  active: NavId;
  // Needed to build the "assignList" destination (mounter-assigned worklist
  // is scoped to the current vendor) — omit it and that tab stays inactive.
  vendorId?: string;
};

export function BottomNavBar({ active, vendorId }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors, insets.bottom), [colors, insets.bottom]);

  // Only home/profile/assignList (when vendorId is known) have a destination
  // today — summary renders as an inactive placeholder until a job-provider
  // work-summary screen exists.
  const destinations: Partial<Record<NavId, Parameters<typeof router.push>[0]>> = {
    profile: '/profile',
    ...(vendorId
      ? {
          assignList: {
            pathname: '/job-provider-worklist',
            params: { type: 'mounter_assigned', vendorId, label: 'Mounter Assigned' },
          },
        }
      : {}),
  };

  return (
    <View style={styles.bar}>
      {ITEMS.map((item) => {
        const isActive = item.id === active;
        const destination = destinations[item.id];
        return (
          <Pressable
            key={item.id}
            style={styles.item}
            disabled={!destination}
            onPress={destination ? () => router.push(destination) : undefined}
            hitSlop={10}
          >
            <Ionicons name={item.icon} size={24} color={isActive ? colors.primaryStart : colors.textFaint} />
          </Pressable>
        );
      })}
    </View>
  );
}

function createStyles(colors: ThemeColors, bottomInset: number) {
  return StyleSheet.create({
    bar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
      height: 76 + bottomInset,
      paddingTop: 12,
      paddingBottom: 14 + bottomInset,
      backgroundColor: colors.surfaceElevated,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    item: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}
