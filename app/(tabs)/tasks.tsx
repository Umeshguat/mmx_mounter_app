import { useCallback, useMemo, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { radius, spacing } from '../../theme/spacing';
import type { ThemeColors } from '../../theme/colors';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { getMounterWorklist, type MounterWorklistType } from '../../services/api';

const OVERVIEW_TYPES: MounterWorklistType[] = ['today', 'pending', 'advance'];

export default function Tasks() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      setError(null);
      Promise.all(OVERVIEW_TYPES.map((type) => getMounterWorklist(type, 1)))
        .then((results) => {
          setItems(results.flatMap((r, index) => r.items.map((item) => ({ ...item, __worklistType: OVERVIEW_TYPES[index] }))));
        })
        .catch((err) => setError(err instanceof Error ? err.message : 'Could not load tasks.'))
        .finally(() => setLoading(false));
    }, [])
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.lg }]}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.push('/(tabs)')} hitSlop={10} style={styles.topBarLeft}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
          <Text style={styles.pageName}>My Task</Text>
        </Pressable>
        <View style={styles.topBarActions}>
          <Ionicons name="search" size={22} color={colors.text} style={styles.actionIcon} />
          <View>
            <Ionicons name="options-outline" size={22} color={colors.text} />
            <View style={styles.filterDot}>
              <Badge variant="dot" tone="red" size={7} />
            </View>
          </View>
        </View>
      </View>

      <Text style={styles.subtitle}>{items.length} tasks</Text>

      {loading ? (
        <ActivityIndicator color={colors.primaryStart} style={styles.loading} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : items.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconWrap}>
            <Ionicons name="calendar-outline" size={32} color={colors.textFaint} />
          </View>
          <Text style={styles.emptyTitle}>No tasks yet</Text>
          <Text style={styles.emptySubtitle}>New assignments will show up here.</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item, index) => String(item.cart_id ?? index)}
          renderItem={({ item }) => (
            <Pressable
              onPress={() =>
                router.push({ pathname: '/task-detail', params: { cartId: item.cart_id, type: item.__worklistType } })
              }
            >
              <Card elevated padding={0} style={styles.row}>
                <View style={styles.iconBadge}>
                  <Ionicons name="document-text-outline" size={20} color={colors.primaryStart} />
                </View>
                <View style={styles.info}>
                  <Text style={styles.title} numberOfLines={1}>
                    {item.media_name ?? `Cart #${item.cart_id}`}
                  </Text>
                  <Text style={styles.date}>{item.start_date ?? item.order_number ?? ''}</Text>
                </View>
              </Card>
            </Pressable>
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: spacing.lg,
    },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.xl,
    },
    topBarLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    pageName: {
      marginLeft: spacing.sm,
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
    },
    topBarActions: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    actionIcon: {
      marginRight: spacing.md,
    },
    filterDot: {
      position: 'absolute',
      top: -2,
      right: -2,
    },
    subtitle: {
      marginTop: 2,
      fontSize: 15,
      color: colors.textMuted,
      marginBottom: spacing.lg,
    },
    loading: {
      marginTop: spacing.xl,
    },
    errorText: {
      fontSize: 14,
      color: colors.danger,
      textAlign: 'center',
      marginTop: spacing.xl,
    },
    listContent: {
      paddingBottom: spacing.xl,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'stretch',
      marginBottom: spacing.md,
      overflow: 'hidden',
    },
    iconBadge: {
      width: 44,
      height: 44,
      borderRadius: radius.md,
      backgroundColor: colors.cardBlue,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: spacing.md,
      alignSelf: 'center',
    },
    info: {
      flex: 1,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      justifyContent: 'center',
    },
    title: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
    },
    date: {
      marginTop: 2,
      fontSize: 13,
      color: colors.textMuted,
    },
    emptyState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingBottom: spacing.xxl,
    },
    emptyIconWrap: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: colors.surfaceMuted,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.md,
    },
    emptyTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: colors.text,
    },
    emptySubtitle: {
      marginTop: spacing.xs,
      fontSize: 14,
      color: colors.textMuted,
    },
  });
}
