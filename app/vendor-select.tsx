import { useMemo, useState } from 'react';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { spacing } from '../theme/spacing';
import type { ThemeColors } from '../theme/colors';
import { Dropdown } from '../components/Dropdown';
import { GradientButton } from '../components/GradientButton';
import { VendorHandoffIllustration } from '../components/VendorHandoffIllustration';
import { useApp } from '../context/AppContext';
import { vendors } from '../data/mockData';
import type { Vendor } from '../data/mockData';

export default function VendorSelect() {
  const { selectVendor } = useApp();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [vendor, setVendor] = useState<Vendor | null>(null);

  const onContinue = async () => {
    if (!vendor) return;
    await selectVendor(vendor);
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <VendorHandoffIllustration />

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

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.xxl,
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
}
