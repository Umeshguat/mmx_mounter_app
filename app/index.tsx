import { useEffect } from 'react';
import { router } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { GrowWordmark, MmxWordmark } from '../components/MmxWordmark';
import { SplashIllustration } from '../components/SplashIllustration';
import { useApp } from '../context/AppContext';

export default function Splash() {
  const { isLoading, isLoggedIn, vendor } = useApp();

  useEffect(() => {
    if (isLoading) return;
    const timer = setTimeout(() => {
      if (!isLoggedIn) {
        router.replace('/login');
      } else if (!vendor) {
        router.replace('/vendor-select');
      } else {
        router.replace('/(tabs)');
      }
    }, 1400);
    return () => clearTimeout(timer);
  }, [isLoading, isLoggedIn, vendor]);

  return (
    <View style={styles.container}>
      <SplashIllustration />

      <View style={styles.wordmarkBlock}>
        <View style={styles.wordmarkRow}>
          <GrowWordmark />
          <Text style={styles.plainText}> Your</Text>
        </View>
        <Text style={styles.plainText}>Business</Text>
        <View style={styles.wordmarkRow}>
          <Text style={styles.plainText}>with </Text>
          <MmxWordmark />
        </View>
      </View>

      <ActivityIndicator color={colors.primaryStart} size="small" style={styles.spinner} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  wordmarkBlock: {
    alignItems: 'flex-start',
    marginBottom: spacing.xl,
  },
  wordmarkRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  plainText: {
    fontSize: 46,
    fontWeight: '800',
    color: colors.text,
    lineHeight: 52,
  },
  spinner: {
    marginTop: spacing.md,
  },
});
