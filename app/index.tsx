import { useEffect, useMemo } from 'react';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { ILLUSTRATION_SIZE, spacing } from '../theme/spacing';
import type { ThemeColors } from '../theme/colors';
import { GrowWordmark, MmxWordmark } from '../components/MmxWordmark';
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
          source={require('../assets/images/splash-worker.png')}
          style={styles.illustration}
          resizeMode="contain"
        />
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
      paddingTop: spacing.xl + 40,
    },
    illustration: {
      width: ILLUSTRATION_SIZE,
      height: ILLUSTRATION_SIZE,
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
    wordmarkRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoRow: {
      marginTop: spacing.md,
      alignItems: 'center',
    },
    plainText: {
      fontSize: 46,
      fontWeight: '800',
      color: colors.text,
      lineHeight: 50,
      textAlign: 'center',
    },
  });
}
