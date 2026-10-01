import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { ActivityIndicator, FlatList, Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { radius, spacing } from '../theme/spacing';
import type { ThemeColors } from '../theme/colors';
import { Card } from '../components/Card';
import { DateField } from '../components/DateField';
import { ScreenHeader, useScreenHeaderHeight } from '../components/ScreenHeader';
import { ScreenGradient } from '../components/ScreenGradient';
import { getMonitorUploadedPhotos, type MonitorUploadedTask } from '../services/api';

function toApiDate(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// Order matches the fields the user asked to see, in this exact sequence.
const DETAIL_FIELDS: { key: keyof MonitorUploadedTask; label: string }[] = [
  { key: 'orderNumber', label: 'Order Number' },
  { key: 'mediaId', label: 'Media ID' },
  { key: 'mediaCode', label: 'Media Code' },
  { key: 'width', label: 'Width' },
  { key: 'height', label: 'Height' },
  { key: 'size', label: 'Size' },
  { key: 'mediaType', label: 'Media Type' },
  { key: 'quantity', label: 'Qty' },
  { key: 'displayStartDate', label: 'Start Date' },
  { key: 'displayEndDate', label: 'End Date' },
  { key: 'addedOn', label: 'Added On' },
  { key: 'clientName', label: 'Client Name' },
  { key: 'lightType', label: 'Light Type' },
];

export default function MonitorUploadedPhotos() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const headerHeight = useScreenHeaderHeight();

  const [startDate, setStartDate] = useState<Date | null>(() => new Date());
  const [endDate, setEndDate] = useState<Date | null>(() => new Date());
  const [tasks, setTasks] = useState<MonitorUploadedTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewUri, setPreviewUri] = useState<string | null>(null);

  const load = useCallback((start: Date | null, end: Date | null) => {
    setLoading(true);
    setError(null);
    getMonitorUploadedPhotos(start ? toApiDate(start) : undefined, end ? toApiDate(end) : undefined)
      .then(setTasks)
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load uploaded photos.'))
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(
    useCallback(() => {
      load(startDate, endDate);
    }, [load, startDate, endDate])
  );

  // Changing either date updates state only — the useFocusEffect above
  // re-runs automatically since it depends on startDate/endDate and the
  // screen stays focused while the picker is used.

  return (
    <ScreenGradient style={styles.container}>
      <ScreenHeader title="Uploaded Photos" />

      <View style={[styles.filterRow, { marginTop: headerHeight + spacing.md }]}>
        <View style={styles.filterField}>
          <DateField placeholder="Start date" value={startDate} onChange={setStartDate} />
        </View>
        <View style={styles.filterField}>
          <DateField placeholder="End date" value={endDate} onChange={setEndDate} />
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primaryStart} style={styles.loading} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item, index) => String(item.cartMonitorId ?? index)}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <Card elevated tint="surface" style={styles.taskCard}>
              <Text style={styles.taskTitle}>{item.mediaName ?? 'Untitled'}</Text>
              {item.campaignName ? <Text style={styles.taskSubtitle}>{item.campaignName}</Text> : null}

              <View style={styles.detailGrid}>
                {DETAIL_FIELDS.map(({ key, label }) => {
                  const value = item[key];
                  if (value === undefined || value === null || value === '') return null;
                  return (
                    <View key={label} style={styles.row}>
                      <Text style={styles.label}>{label}</Text>
                      <Text style={styles.value}>{String(value)}</Text>
                    </View>
                  );
                })}
              </View>

              {item.photos.length > 0 ? (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.photoRow}
                >
                  {item.photos.map((photo, index) => (
                    <Pressable
                      key={`${photo.photoId}-${index}`}
                      onPress={() => setPreviewUri(photo.imageUrl)}
                    >
                      <Image source={{ uri: photo.imageUrl }} style={styles.thumb} resizeMode="cover" />
                    </Pressable>
                  ))}
                </ScrollView>
              ) : null}
            </Card>
          )}
          ListEmptyComponent={
            <Card tint="muted" style={styles.emptyCard}>
              <Text style={styles.emptyText}>No uploaded photos in this range.</Text>
            </Card>
          }
        />
      )}

      <Modal
        visible={!!previewUri}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewUri(null)}
      >
        <Pressable style={styles.previewBackdrop} onPress={() => setPreviewUri(null)}>
          <Image source={{ uri: previewUri ?? undefined }} style={styles.previewImage} resizeMode="contain" />
          <Pressable style={styles.previewClose} onPress={() => setPreviewUri(null)}>
            <Ionicons name="close" size={22} color={colors.white} />
          </Pressable>
        </Pressable>
      </Modal>
    </ScreenGradient>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'transparent',
    },
    filterRow: {
      flexDirection: 'row',
      gap: spacing.md,
      paddingHorizontal: spacing.lg,
      marginBottom: spacing.md,
    },
    filterField: {
      flex: 1,
    },
    content: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.xl,
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
    taskCard: {
      marginBottom: spacing.md,
    },
    taskTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: colors.text,
    },
    taskSubtitle: {
      marginTop: 2,
      fontSize: 13,
      color: colors.textMuted,
    },
    detailGrid: {
      marginTop: spacing.sm,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      paddingVertical: spacing.xs,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      gap: spacing.md,
    },
    label: {
      fontSize: 13,
      color: colors.textMuted,
    },
    value: {
      flex: 1,
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
      textAlign: 'right',
    },
    photoRow: {
      gap: spacing.sm,
      marginTop: spacing.md,
    },
    thumb: {
      width: 72,
      height: 72,
      borderRadius: radius.md,
      backgroundColor: colors.surfaceMuted,
      borderWidth: 1,
      borderColor: colors.border,
    },
    emptyCard: {
      marginTop: spacing.xl,
    },
    emptyText: {
      fontSize: 14,
      color: colors.onBackgroundMuted,
      textAlign: 'center',
    },
    previewBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.9)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    previewImage: {
      width: '100%',
      height: '80%',
    },
    previewClose: {
      position: 'absolute',
      top: spacing.xxl,
      right: spacing.lg,
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: 'rgba(255,255,255,0.15)',
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}
