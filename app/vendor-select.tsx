import { useState } from 'react';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { Dropdown } from '../components/Dropdown';
import { GradientButton } from '../components/GradientButton';
import { useApp } from '../context/AppContext';
import { vendors } from '../data/mockData';
import type { Vendor } from '../data/mockData';

export default function VendorSelect() {
  const { selectVendor } = useApp();
  const [vendor, setVendor] = useState<Vendor | null>(null);

  const onContinue = async () => {
    if (!vendor) return;
    await selectVendor(vendor);
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <View style={styles.illustration}>
        <Ionicons name="person" size={72} color={colors.text} />
        <View style={styles.docChip}>
          <View style={styles.docDot} />
          <View style={styles.docLine} />
        </View>
        <Ionicons name="person" size={72} color={colors.text} />
      </View>

      <View style={styles.checkBadge}>
        <Ionicons name="checkmark" size={18} color={colors.primaryStart} />
      </View>

      <View style={styles.header}>
        <Text style={styles.title}>Vendor</Text>
        <Text style={styles.subtitle}>Please select the Vendor</Text>
      </View>

      <Dropdown
        icon="person-outline"
        placeholder="Select Vendor"
        value={vendor}
        options={vendors}
        onSelect={setVendor}
      />

      <GradientButton
        label="Continue"
        icon="arrow-forward"
        onPress={onContinue}
        disabled={!vendor}
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
  },
  illustration: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xxl,
  },
  docChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderRadius: 10,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    width: 90,
  },
  docDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primaryStart,
    marginRight: spacing.xs,
  },
  docLine: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.primaryStart,
  },
  checkBadge: {
    alignSelf: 'center',
    marginTop: -spacing.xl - 24,
    marginBottom: spacing.lg,
    width: 30,
    height: 30,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    marginTop: spacing.xs,
    fontSize: 15,
    color: colors.textMuted,
  },
  button: {
    marginTop: spacing.xl,
  },
});
