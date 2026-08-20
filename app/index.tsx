import { useEffect } from 'react';
import { router } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { GrowWordmark, MmxWordmark } from '../components/MmxWordmark';
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
      <View style={styles.illustration}>
        <Ionicons name="person-circle-outline" size={64} color={colors.cardBlueIcon} />
        <View style={styles.docStack}>
          <Ionicons name="document-text-outline" size={40} color={colors.primaryStart} />
          <Ionicons name="grid-outline" size={28} color={colors.cardRedIcon} style={styles.docBadge} />
        </View>
        <Ionicons name="person-circle-outline" size={64} color={colors.cardBlueIcon} />
      </View>

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
  illustration: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: spacing.xxl,
  },
  docStack: {
    alignItems: 'center',
  },
  docBadge: {
    marginTop: -8,
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
    fontSize: 34,
    fontWeight: '800',
    color: colors.text,
  },
  spinner: {
    marginTop: spacing.md,
  },
});
