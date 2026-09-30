import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { ActivityIndicator, FlatList, Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { radius, spacing } from '../theme/spacing';
import type { ThemeColors } from '../theme/colors';
import { Card } from '../components/Card';
import { DateField } from '../components/DateField';
import { ScreenHeader, useScreenHeaderHeight } from '../components/ScreenHeader';
import { ScreenGradient } from '../components/ScreenGradient';
import { getMonitorUploadedPhotos, type MonitorUploadedPhoto } from '../services/api';

function toApiDate(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export default function MonitorUploadedPhotos() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const headerHeight = useScreenHeaderHeight();

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [photos, setPhotos] = useState<MonitorUploadedPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewUri, setPreviewUri] = useState<string | null>(null);

  const load = useCallback((start: Date | null, end: Date | null) => {
    setLoading(true);
    setError(null);
    getMonitorUploadedPhotos(start ? toApiDate(start) : undefined, end ? toApiDate(end) : undefined)
      .then(setPhotos)
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
          data={photos}
          keyExtractor={(item, index) => String(item.photoId ?? index)}
          numColumns={3}
          contentContainerStyle={styles.content}
          columnWrapperStyle={styles.gridRow}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <Pressable style={styles.thumbWrap} onPress={() => setPreviewUri(item.imageUrl)}>
              <Image source={{ uri: item.imageUrl }} style={styles.thumb} resizeMode="cover" />
              {item.mediaName ? (
                <Text style={styles.thumbLabel} numberOfLines={1}>
                  {item.mediaName}
                </Text>
              ) : null}
            </Pressable>
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
    gridRow: {
      gap: spacing.sm,
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
    thumbWrap: {
      flex: 1,
      maxWidth: '32%',
      marginBottom: spacing.sm,
    },
    thumb: {
      width: '100%',
      aspectRatio: 1,
      borderRadius: radius.md,
      backgroundColor: colors.surfaceMuted,
      borderWidth: 1,
      borderColor: colors.border,
    },
    thumbLabel: {
      marginTop: 4,
      fontSize: 11,
      color: colors.textMuted,
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
