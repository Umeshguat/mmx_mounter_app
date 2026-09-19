import { useMemo } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { spacing } from '../theme/spacing';
import type { ThemeColors } from '../theme/colors';
import { ProfileContent } from '../components/ProfileContent';
import { ScreenGradient } from '../components/ScreenGradient';

// Deliberately a standalone route (not (tabs)/profile.tsx) — pushing into the
// (tabs) group would mount the mounter's Tabs navigator (and its "+" button)
// underneath a job-provider session, which doesn't have a mounter identity.
export default function JobProviderProfile() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();

  return (
    <ScreenGradient style={styles.container}>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.lg }]}>
        <ProfileContent />
      </ScrollView>
    </ScreenGradient>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'transparent',
    },
    content: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.xl,
    },
  });
}
