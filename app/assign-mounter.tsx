import { useMemo, useState } from 'react';
import { router } from 'expo-router';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { spacing } from '../theme/spacing';
import type { ThemeColors } from '../theme/colors';
import { Card } from '../components/Card';
import { TextField } from '../components/TextField';
import { Dropdown } from '../components/Dropdown';
import { GradientButton } from '../components/GradientButton';
import { ScreenHeader, useScreenHeaderHeight } from '../components/ScreenHeader';
import { useAssignments } from '../context/AssignmentContext';
import { mounters } from '../data/mockData';

const mounterOptions = mounters.map((m) => ({ id: m.id, name: m.name }));

export default function AssignMounter() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const headerHeight = useScreenHeaderHeight();
  const { addAssignment } = useAssignments();

  const [campaignName, setCampaignName] = useState('');
  const [location, setLocation] = useState('');
  const [mounter, setMounter] = useState<{ id: string; name: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = campaignName.trim().length > 0 && !!mounter;

  const onAssign = async () => {
    if (!canSubmit || !mounter) return;
    setSubmitting(true);
    await addAssignment({
      campaignName: campaignName.trim(),
      location: location.trim() || undefined,
      mounterId: mounter.id,
      mounterName: mounter.name,
    });
    setSubmitting(false);
    Alert.alert('Task assigned', `${campaignName.trim()} has been assigned to ${mounter.name}.`, [
      { text: 'OK', onPress: () => router.back() },
    ]);
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
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Campaign / task name</Text>
          <TextField
            icon="pricetag-outline"
            placeholder="Enter campaign name"
            value={campaignName}
            onChangeText={setCampaignName}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Location</Text>
          <TextField
            icon="location-outline"
            placeholder="Enter location (optional)"
            value={location}
            onChangeText={setLocation}
          />
        </View>

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
    field: {
      marginBottom: spacing.md,
    },
    fieldLast: {
      marginBottom: 0,
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
