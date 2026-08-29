import { useEffect, useMemo, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { spacing } from '../theme/spacing';
import type { ThemeColors } from '../theme/colors';
import { Card } from '../components/Card';
import { Dropdown } from '../components/Dropdown';
import { GradientButton } from '../components/GradientButton';
import { ScreenHeader, useScreenHeaderHeight } from '../components/ScreenHeader';
import { assignMounter, getMounters } from '../services/api';

export default function AssignMounter() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const headerHeight = useScreenHeaderHeight();

  const { cartId, title, subtitle } = useLocalSearchParams<{ cartId: string; title?: string; subtitle?: string }>();

  const [mounterOptions, setMounterOptions] = useState<{ id: string; name: string }[]>([]);
  const [mountersError, setMountersError] = useState<string | null>(null);
  const [mounter, setMounter] = useState<{ id: string; name: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getMounters()
      .then((list) => setMounterOptions(list.map((m) => ({ id: String(m.mounterId), name: m.mounterName }))))
      .catch((err) => setMountersError(err instanceof Error ? err.message : 'Could not load mounters.'));
  }, []);

  const canSubmit = !!cartId && !!mounter;

  const onAssign = async () => {
    if (!canSubmit || !mounter || !cartId) return;
    setSubmitting(true);
    try {
      await assignMounter(cartId, mounter.id);
      Alert.alert('Task assigned', `${title ?? 'This task'} has been assigned to ${mounter.name}.`, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err) {
      Alert.alert('Could not assign mounter', err instanceof Error ? err.message : 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Assign Mounter" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: headerHeight + spacing.lg }]}
        keyboardShouldPersistTaps="handled"
      >
      <Card tint="muted" style={styles.section}>
        <Text style={styles.taskTitle}>{title ?? `Cart #${cartId}`}</Text>
        {subtitle ? <Text style={styles.taskSubtitle}>{subtitle}</Text> : null}
      </Card>

      <Card tint="muted" style={styles.section}>
        <View style={styles.fieldLast}>
          <Text style={styles.fieldLabel}>Assign to mounter</Text>
          <Dropdown
            icon="person-outline"
            placeholder="Select mounter"
            value={mounter}
            options={mounterOptions}
            onSelect={setMounter}
            searchable
          />
          {mountersError ? <Text style={styles.errorText}>{mountersError}</Text> : null}
        </View>
      </Card>

      <GradientButton
        label="Assign Task"
        icon="checkmark"
        onPress={onAssign}
        loading={submitting}
        disabled={!canSubmit}
        style={styles.submitButton}
      />
      </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    flex: {
      flex: 1,
    },
    content: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.xl,
    },
    section: {
      marginBottom: spacing.lg,
    },
    taskTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: colors.text,
    },
    taskSubtitle: {
      marginTop: 2,
      fontSize: 14,
      color: colors.textMuted,
    },
    fieldLast: {
      marginBottom: 0,
    },
    errorText: {
      marginTop: spacing.xs,
      fontSize: 13,
      color: colors.danger,
    },
    fieldLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.xs,
    },
    submitButton: {
      marginTop: spacing.md,
    },
  });
}
