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

      <View style={styles.centerSection}>
        <Image
          source={require('../assets/images/growth-arrow.png')}
          style={styles.arrow}
          resizeMode="contain"
        />

        <Text style={styles.title}>
          <Text style={styles.titleBold}>GROW</Text> YOUR{'\n'}BUSINESS
        </Text>
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
      backgroundColor: 'transparent',
      paddingHorizontal: spacing.lg,
    },
    centerSection: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    arrow: {
      width: 380,
      height: 250,
    },
    bottomSection: {
      alignItems: 'center',
      paddingBottom: spacing.xl,
    },
    title: {
      fontSize: 45,
      fontWeight: '400',
      color: colors.onBackground,
      letterSpacing: 1,
      lineHeight: 46,
      textAlign: 'center',
    },
    titleBold: {
      fontWeight: '800',
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
      fontSize: 18,
      fontWeight: '600',
      color: colors.onBackgroundMuted,
      letterSpacing: 2,
    },
    logo: {
      width: 350,
      height: 175,
    },
  });
}
