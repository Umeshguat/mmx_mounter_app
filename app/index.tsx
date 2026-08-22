import { useEffect } from 'react';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
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
      <StatusBar hidden />

      <View style={styles.topSection}>
        <SplashIllustration />
      </View>

      <View style={styles.headingSection}>
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

      <View style={styles.bottomSection}>
        <ActivityIndicator color={colors.text} size="small" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
  },
  topSection: {
    flex: 0.45,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: spacing.xl,
  },
  headingSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  bottomSection: {
    alignItems: 'center',
    paddingBottom: spacing.xl,
  },
  wordmarkRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  plainText: {
    fontSize: 40,
    fontWeight: '800',
    color: colors.text,
    lineHeight: 44,
  },
});
