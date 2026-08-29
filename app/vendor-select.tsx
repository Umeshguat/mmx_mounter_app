import { useEffect, useMemo, useState } from 'react';
import { router } from 'expo-router';
import { ActivityIndicator, Alert, Image, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { ILLUSTRATION_SIZE, spacing } from '../theme/spacing';
import type { ThemeColors } from '../theme/colors';
import { Dropdown } from '../components/Dropdown';
import { GradientButton } from '../components/GradientButton';
import { useApp } from '../context/AppContext';
import { getSelectableVendors } from '../services/api';

type VendorOption = { id: string; name: string };

export default function VendorSelect() {
  const { selectVendor } = useApp();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [vendorOptions, setVendorOptions] = useState<VendorOption[]>([]);
  const [vendorsLoading, setVendorsLoading] = useState(true);
  const [vendorsError, setVendorsError] = useState<string | null>(null);
  const [vendor, setVendor] = useState<VendorOption | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setVendorsLoading(true);
    setVendorsError(null);
    getSelectableVendors()
      .then((vendors) =>
        setVendorOptions(vendors.map((v) => ({ id: String(v.vendorId), name: v.vendorName })))
      )
      .catch((error) => setVendorsError(error instanceof Error ? error.message : 'Could not load vendors.'))
      .finally(() => setVendorsLoading(false));
  }, []);

  const onContinue = async () => {
    if (!vendor) return;
    setSubmitting(true);
    try {
      await selectVendor(vendor);
      router.replace({
        pathname: '/job-provider-dashboard',
        params: { vendorId: vendor.id, vendorName: vendor.name },
      });
    } catch (error) {
      Alert.alert('Could not select vendor', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.illustrationWrap}>
        <Image
          source={require('../assets/images/vendor-handshake.png')}
          style={styles.illustration}
          resizeMode="contain"
        />
      </View>

      <View style={styles.header}>
        <Text style={styles.title}>Vendor</Text>
        <Text style={styles.subtitle}>Please select the Vendor</Text>
      </View>

      {vendorsLoading ? (
        <ActivityIndicator color={colors.primaryStart} style={styles.loading} />
      ) : vendorsError ? (
        <Text style={styles.errorText}>{vendorsError}</Text>
      ) : vendorOptions.length === 0 ? (
        <Text style={styles.errorText}>No vendors are linked to this account.</Text>
      ) : (
        <Dropdown
          icon="person-outline"
          placeholder="Select Vendor"
          value={vendor}
          options={vendorOptions}
          onSelect={setVendor}
          searchable
        />
      )}

      <GradientButton
        label="Continue"
        icon="arrow-forward"
        onPress={onContinue}
        loading={submitting}
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
    illustrationWrap: {
      alignItems: 'center',
      paddingTop: 40,
      marginBottom: spacing.lg,
    },
    illustration: {
      width: ILLUSTRATION_SIZE,
      height: ILLUSTRATION_SIZE,
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
    loading: {
      marginVertical: spacing.md,
    },
    errorText: {
      fontSize: 14,
      color: colors.danger,
      marginVertical: spacing.md,
    },
    button: {
      marginTop: spacing.xl,
    },
  });
}
