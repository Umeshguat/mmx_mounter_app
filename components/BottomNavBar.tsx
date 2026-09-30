import { useMemo } from 'react';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { gradients } from '../theme/colors';
import type { ThemeColors } from '../theme/colors';

// Mirrors (tabs)/_layout.tsx's tab bar look for screens that live outside
// the mounter tab group (e.g. job-provider-dashboard, monitor-dashboard) —
// same icon set, no centered "add" button since these flows don't have a
// quick-add task.
type NavId = 'home' | 'assignList' | 'summary' | 'profile' | 'uploadedPhotos';

const ITEMS: Record<'jobProvider' | 'monitor', { id: NavId; icon: keyof typeof Ionicons.glyphMap }[]> = {
  jobProvider: [
    { id: 'home', icon: 'home' },
    { id: 'assignList', icon: 'people' },
    { id: 'summary', icon: 'document-text' },
    { id: 'profile', icon: 'person' },
  ],
  monitor: [
    { id: 'home', icon: 'home' },
    { id: 'uploadedPhotos', icon: 'images' },
    { id: 'profile', icon: 'person' },
  ],
};

type Props = {
  active: NavId;
  variant?: 'jobProvider' | 'monitor';
  // Needed to build the "assignList" destination (mounter-assigned worklist
  // is scoped to the current vendor) — omit it and that tab stays inactive.
  // Ignored for the monitor variant, which has no per-vendor tab.
  vendorId?: string;
};

export function BottomNavBar({ active, variant = 'jobProvider', vendorId }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors, insets.bottom), [colors, insets.bottom]);

  // Only home/profile/assignList (when vendorId is known) have a destination
  // today — summary renders as an inactive placeholder until a job-provider
  // work-summary screen exists.
  const destinations: Partial<Record<NavId, Parameters<typeof router.push>[0]>> =
    variant === 'monitor'
      ? {
          home: '/monitor-dashboard',
          uploadedPhotos: '/monitor-uploaded-photos',
          // Deliberately NOT '/profile' — that path resolves into
          // (tabs)/profile.tsx since (tabs) is a route group, which would
          // mount the mounter's Tabs navigator underneath this session.
          profile: '/job-provider-profile',
        }
      : {
          // Deliberately NOT '/profile' — see above.
          profile: '/job-provider-profile',
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
      <LinearGradient
        colors={gradients.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {ITEMS[variant].map((item) => {
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
            <Ionicons name={item.icon} size={26} color={isActive ? colors.onBackgroundIcon : colors.onBackgroundIconMuted} />
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
      backgroundColor: 'transparent',
    },
    item: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}
