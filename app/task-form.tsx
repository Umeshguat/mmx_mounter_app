import { useEffect, useMemo, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { spacing } from '../theme/spacing';
import type { ThemeColors } from '../theme/colors';
import { TextField } from '../components/TextField';
import { GradientButton } from '../components/GradientButton';
import { ImagesList, type PickedImage } from '../components/ImagesList';
import { Card } from '../components/Card';
import { ScreenHeader, useScreenHeaderHeight } from '../components/ScreenHeader';
import { getTaskDetail, updateTask } from '../services/api';

export default function TaskForm() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const headerHeight = useScreenHeaderHeight();

  const { cartId, type } = useLocalSearchParams<{ cartId?: string; type?: string }>();

  // Worklist type tells us which kind of task this is: today/pending/advance are
  // mounting jobs (only need mounting photos); mounting_removal/pending_mounting_removal
  // are removal jobs (only need removal photos). Unknown/missing type (e.g. a direct
  // deep link) falls back to showing both, same as before.
  const isMountingOnly = type === 'today' || type === 'pending' || type === 'advance';
  const isRemovalOnly = type === 'mounting_removal' || type === 'pending_mounting_removal';
  const showMounting = !isRemovalOnly;
  const showRemoval = !isMountingOnly;

  const [task, setTask] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(!!cartId);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [remarks, setRemarks] = useState('');
  const [mountingPhotos, setMountingPhotos] = useState<PickedImage[]>([]);
  const [removalPhotos, setRemovalPhotos] = useState<PickedImage[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!cartId) return;
    setLoading(true);
    setLoadError(null);
    getTaskDetail(cartId)
      .then(setTask)
      .catch((err) => setLoadError(err instanceof Error ? err.message : 'Could not load task details.'))
      .finally(() => setLoading(false));
  }, [cartId]);

  const canSubmit =
    (showMounting && mountingPhotos.length > 0) || (showRemoval && removalPhotos.length > 0);

  const onSubmit = async () => {
    if (!cartId || !canSubmit) return;
    setSubmitting(true);
    try {
      await updateTask(cartId, {
        remarks: remarks.trim(),
        mountingPhotos: showMounting ? mountingPhotos : [],
        removalPhotos: showRemoval ? removalPhotos : [],
      });
      // Skip past task-detail straight back to the worklist/task list this task
      // came from — that screen's useFocusEffect re-fetches on regaining focus,
      // so it (and the dashboard, next time it's visited) shows updated data.
      Alert.alert('Task updated', 'Your remarks and photos have been submitted.', [
        { text: 'OK', onPress: () => router.dismiss(2) },
      ]);
    } catch (err) {
      Alert.alert('Could not update task', err instanceof Error ? err.message : 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!cartId) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Complete Task" />
        <View style={[styles.emptyState, { marginTop: headerHeight + spacing.lg }]}>
          <Text style={styles.emptyText}>Pick a task from My Task to add remarks and photos.</Text>
          <GradientButton label="Go to My Task" onPress={() => router.push('/(tabs)/tasks')} style={styles.emptyButton} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title="Complete Task" />

      {loading ? (
        <ActivityIndicator color={colors.primaryStart} style={[styles.loading, { marginTop: headerHeight + spacing.lg }]} />
      ) : loadError ? (
        <Text style={[styles.errorText, { marginTop: headerHeight + spacing.lg }]}>{loadError}</Text>
      ) : (
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            contentContainerStyle={[styles.content, { paddingTop: headerHeight + spacing.lg }]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Card tint="muted" style={styles.section}>
              <Text style={styles.taskTitle}>{task?.media_name ?? task?.campaign_name ?? `Cart #${cartId}`}</Text>
              {task?.campaign_name ? <Text style={styles.taskSubtitle}>{task.campaign_name}</Text> : null}
              {task?.start_date || task?.end_date ? (
                <Text style={styles.taskSubtitle}>
                  {task?.start_date ?? ''}
                  {task?.start_date && task?.end_date ? ' - ' : ''}
                  {task?.end_date ?? ''}
                </Text>
              ) : null}
            </Card>

            <Card tint="muted" style={styles.section}>
              <Text style={styles.fieldLabel}>Remarks</Text>
              <TextField
                icon="chatbubble-ellipses-outline"
                placeholder="Enter remarks for this visit"
                value={remarks}
                onChangeText={setRemarks}
                multiline
                numberOfLines={3}
                style={styles.remarksInput}
              />
            </Card>

            {showMounting ? (
              <Card tint="muted" style={styles.section}>
                <ImagesList label="Mounting Photos" images={mountingPhotos} onAdd={(image) => setMountingPhotos((prev) => [...prev, image])} />
              </Card>
            ) : null}

            {showRemoval ? (
              <Card tint="muted" style={styles.section}>
                <ImagesList label="Removal Photos" images={removalPhotos} onAdd={(image) => setRemovalPhotos((prev) => [...prev, image])} />
              </Card>
            ) : null}

            <GradientButton
              label="Submit"
              onPress={onSubmit}
              loading={submitting}
              disabled={!canSubmit}
              style={styles.submitButton}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      )}
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
      paddingBottom: spacing.xxl,
    },
    loading: {
      alignSelf: 'center',
    },
    errorText: {
      fontSize: 14,
      color: colors.danger,
      textAlign: 'center',
      paddingHorizontal: spacing.lg,
    },
    emptyState: {
      flex: 1,
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
    },
    emptyText: {
      fontSize: 15,
      color: colors.textMuted,
      textAlign: 'center',
      marginBottom: spacing.lg,
    },
    emptyButton: {
      alignSelf: 'stretch',
    },
    section: {
      marginBottom: spacing.md,
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
    fieldLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.xs,
    },
    remarksInput: {
      height: 80,
      paddingTop: spacing.sm,
      textAlignVertical: 'top',
    },
    submitButton: {
      marginTop: spacing.lg,
    },
  });
}
