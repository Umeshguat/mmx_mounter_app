import { useEffect, useMemo } from 'react';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { spacing } from '../theme/spacing';
import type { ThemeColors } from '../theme/colors';
import { useApp } from '../context/AppContext';

export default function Splash() {
  const { isLoading, isLoggedIn, vendor, userProfile } = useApp();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  useEffect(() => {
    if (isLoading) return;
    const timer = setTimeout(() => {
      if (!isLoggedIn) {
        router.replace('/login');
      } else if (userProfile?.loginUserType === '12') {
        // Job-provider (other vendor): always lands back on their own
        // dashboard, never the mounter tabs — matching login.tsx's fresh-login routing.
        if (!vendor) {
          router.replace('/vendor-select');
        } else {
          router.replace({
            pathname: '/job-provider-dashboard',
            params: { vendorId: vendor.id, vendorName: vendor.name },
          });
        }
      } else {
        router.replace('/(tabs)');
      }
    }, 1400);
    return () => clearTimeout(timer);
  }, [isLoading, isLoggedIn, vendor, userProfile]);

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      <View style={styles.topSection}>
        <Image
          source={require('../assets/images/growth-arrow.png')}
          style={styles.arrow}
          resizeMode="contain"
        />
      </View>

      <View style={styles.headingSection}>
        <Text style={styles.title}>GROW YOUR{'\n'}BUSINESS</Text>
        <View style={styles.withRow}>
          <View style={styles.withLine} />
          <Text style={styles.withText}>WITH</Text>
          <View style={styles.withLine} />
        </View>

        <Image
          source={require('../assets/images/mmx-cloud-badge.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <View style={styles.bottomSection}>
        <ActivityIndicator color={colors.onBackground} size="small" />
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
      paddingTop: spacing.xl + 40,
    },
    arrow: {
      width: 220,
      height: 140,
    },
    headingSection: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    bottomSection: {
      alignItems: 'center',
      paddingBottom: spacing.xl,
    },
    title: {
      fontSize: 30,
      fontWeight: '800',
      color: colors.onBackground,
      letterSpacing: 1,
      lineHeight: 38,
      textAlign: 'center',
    },
    withRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: spacing.md,
      marginBottom: spacing.xl,
    },
    withLine: {
      width: 28,
      height: 1,
      backgroundColor: colors.onBackgroundMuted,
      marginHorizontal: spacing.sm,
    },
    withText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.onBackgroundMuted,
      letterSpacing: 2,
    },
    logo: {
      width: 260,
      height: 190,
    },
  });
}
