import { useEffect, useMemo, useState } from 'react';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { ILLUSTRATION_SIZE, radius, spacing } from '../theme/spacing';
import type { ThemeColors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { getSelectableVendors } from '../services/api';

type VendorOption = { id: string; name: string };

const CARD_GRADIENT = ['#F68D7E', '#DB4438'] as const;

export default function VendorSelect() {
  const { selectVendor } = useApp();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [vendorOptions, setVendorOptions] = useState<VendorOption[]>([]);
  const [vendorsLoading, setVendorsLoading] = useState(true);
  const [vendorsError, setVendorsError] = useState<string | null>(null);
  const [vendor, setVendor] = useState<VendorOption | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [query, setQuery] = useState('');

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

  const filteredOptions = useMemo(() => {
    if (!query.trim()) return vendorOptions;
    const q = query.trim().toLowerCase();
    return vendorOptions.filter((option) => option.name.toLowerCase().includes(q));
  }, [vendorOptions, query]);

  const closePicker = () => {
    setPickerOpen(false);
    setQuery('');
  };

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

      <Text style={styles.title}>Vendor</Text>
      <Text style={styles.subtitle}>Please select the Vendor</Text>

      <LinearGradient colors={CARD_GRADIENT} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={styles.card}>
        <View style={styles.avatar}>
          <Ionicons name="business-outline" size={40} color="rgba(255,255,255,0.85)" />
        </View>

        {vendorsLoading ? (
          <ActivityIndicator color="#FFFFFF" style={styles.loading} />
        ) : vendorsError ? (
          <Text style={styles.errorText}>{vendorsError}</Text>
        ) : vendorOptions.length === 0 ? (
          <Text style={styles.errorText}>No vendors are linked to this account.</Text>
        ) : (
          <Pressable style={styles.glassField} onPress={() => setPickerOpen(true)}>
            <Ionicons name="person-outline" size={18} color="rgba(255,255,255,0.85)" style={styles.glassIcon} />
            <Text style={[styles.glassText, !vendor && styles.glassPlaceholder]} numberOfLines={1}>
              {vendor ? vendor.name : 'Select Vendor'}
            </Text>
            <Ionicons name="chevron-down" size={18} color="rgba(255,255,255,0.85)" />
          </Pressable>
        )}

        <Pressable
          onPress={onContinue}
          disabled={!vendor || submitting}
          style={({ pressed }) => [styles.continueButton, (pressed || !vendor || submitting) && styles.continueButtonPressed]}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.continueButtonText}>CONTINUE</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={styles.continueIcon} />
            </>
          )}
        </Pressable>
      </LinearGradient>

      <Modal visible={pickerOpen} transparent animationType="fade" onRequestClose={closePicker}>
        <Pressable style={styles.pickerBackdrop} onPress={closePicker}>
          <View style={styles.pickerSheet} onStartShouldSetResponder={() => true}>
            <View style={styles.pickerSearchRow}>
              <Ionicons name="search" size={16} color={colors.textMuted} />
              <TextInput
                style={styles.pickerSearchInput}
                placeholder="Search vendor..."
                placeholderTextColor={colors.textFaint}
                value={query}
                onChangeText={setQuery}
                autoFocus
              />
            </View>
            <FlatList
              data={filteredOptions}
              keyExtractor={(item) => item.id}
              keyboardShouldPersistTaps="handled"
              style={styles.pickerOptionList}
              ListEmptyComponent={<Text style={styles.pickerEmptyText}>No matches found</Text>}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.pickerOption}
                  onPress={() => {
                    setVendor(item);
                    closePicker();
                  }}
                >
                  <Text style={styles.pickerOptionText}>{item.name}</Text>
                  {vendor?.id === item.id ? (
                    <Ionicons name="checkmark-circle" size={20} color="#DB4438" />
                  ) : null}
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>
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
      paddingTop: 20,
      marginBottom: spacing.md,
    },
    illustration: {
      width: ILLUSTRATION_SIZE * 0.7,
      height: ILLUSTRATION_SIZE * 0.7,
    },
    title: {
      fontSize: 30,
      fontWeight: '800',
      color: colors.onBackground,
      textAlign: 'center',
    },
    subtitle: {
      marginTop: spacing.xs,
      fontSize: 15,
      color: colors.onBackgroundMuted,
      textAlign: 'center',
      marginBottom: spacing.xl,
    },
    card: {
      marginHorizontal: 20,
      borderRadius: 32,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.xl,
      paddingBottom: spacing.lg,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.25,
      shadowRadius: 24,
      elevation: 8,
    },
    avatar: {
      alignSelf: 'center',
      width: 76,
      height: 76,
      borderRadius: 38,
      backgroundColor: 'rgba(255,255,255,0.18)',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.lg,
    },
    loading: {
      marginBottom: spacing.lg,
    },
    errorText: {
      fontSize: 14,
      color: '#FFFFFF',
      textAlign: 'center',
      marginBottom: spacing.lg,
    },
    glassField: {
      flexDirection: 'row',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255,255,255,0.45)',
      paddingBottom: spacing.sm,
      marginBottom: spacing.xl,
    },
    glassIcon: {
      marginRight: spacing.sm,
    },
    glassText: {
      flex: 1,
      fontSize: 15,
      color: '#FFFFFF',
    },
    glassPlaceholder: {
      color: 'rgba(255,255,255,0.75)',
    },
    continueButton: {
      height: 54,
      borderRadius: radius.pill,
      backgroundColor: '#3B1660',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    continueButtonPressed: {
      opacity: 0.85,
    },
    continueButtonText: {
      fontSize: 16,
      fontWeight: '700',
      letterSpacing: 1,
      color: '#FFFFFF',
    },
    continueIcon: {
      marginLeft: spacing.sm,
    },
    pickerBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.4)',
      justifyContent: 'center',
      paddingHorizontal: spacing.xl,
    },
    pickerSheet: {
      backgroundColor: '#FFFFFF',
      borderRadius: radius.lg,
      maxHeight: 360,
      overflow: 'hidden',
    },
    pickerSearchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    pickerSearchInput: {
      flex: 1,
      fontSize: 15,
      color: colors.text,
      paddingVertical: 4,
    },
    pickerOptionList: {
      flexGrow: 0,
    },
    pickerOption: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    pickerOptionText: {
      fontSize: 16,
      color: colors.text,
    },
    pickerEmptyText: {
      padding: spacing.md,
      fontSize: 14,
      color: colors.textMuted,
      textAlign: 'center',
    },
  });
}
