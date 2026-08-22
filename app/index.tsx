import { useEffect, useMemo } from 'react';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { spacing } from '../theme/spacing';
import type { ThemeColors } from '../theme/colors';
import { GrowWordmark, MmxWordmark } from '../components/MmxWordmark';
import { SplashIllustration } from '../components/SplashIllustration';
import { useApp } from '../context/AppContext';

export default function Splash() {
  const { isLoading, isLoggedIn, vendor } = useApp();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

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
        <Text style={styles.plainText}>with</Text>
        <View style={styles.logoRow}>
          <MmxWordmark size="lg" />
        </View>
      </View>

      <View style={styles.bottomSection}>
        <ActivityIndicator color={colors.primaryStart} size="small" />
      </View>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
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
    logoRow: {
      marginTop: spacing.md,
    },
    plainText: {
      fontSize: 40,
      fontWeight: '800',
      color: colors.text,
      lineHeight: 44,
    },
  });
}
