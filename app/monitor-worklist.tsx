import { useCallback, useEffect, useMemo, useState } from 'react';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { radius, spacing } from '../theme/spacing';
import type { ThemeColors } from '../theme/colors';
import { Card } from '../components/Card';
import { DateField } from '../components/DateField';
import { TextField } from '../components/TextField';
import { ScreenHeader, useScreenHeaderHeight } from '../components/ScreenHeader';
import { ScreenGradient } from '../components/ScreenGradient';
import { getMonitorWorklist, type MonitorWorklistType } from '../services/api';

const SEARCH_DEBOUNCE_MS = 400;

// monitorworklist's start_date/end_date take YYYY-MM-DD (confirmed against
// the backend's validation error message).
function toApiDate(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function parseApiDate(value: string | undefined): Date | null {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const [, yyyy, mm, dd] = match;
  return new Date(Number(yyyy), Number(mm) - 1, Number(dd));
}

const DEFAULT_START_DATE = new Date(2020, 0, 1);

function fieldOf(item: any, keys: string[]): string | undefined {
  for (const key of keys) {
    if (item?.[key] !== undefined && item[key] !== null && item[key] !== '') {
      return String(item[key]);
    }
  }
  return undefined;
}

export default function MonitorWorklist() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const headerHeight = useScreenHeaderHeight();
  const params = useLocalSearchParams<{
    startDate?: string;
    endDate?: string;
    type?: MonitorWorklistType;
    label?: string;
  }>();
  const { type, label } = params;

  const [startDate, setStartDate] = useState<Date>(() => parseApiDate(params.startDate) ?? DEFAULT_START_DATE);
  const [endDate, setEndDate] = useState<Date>(() => parseApiDate(params.endDate) ?? new Date());
  const [items, setItems] = useState<any[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      setError(null);
      const dateArgs: [string?, string?] = type ? [undefined, undefined] : [toApiDate(startDate), toApiDate(endDate)];
      getMonitorWorklist(1, search, ...dateArgs, type)
        .then((result) => {
          setItems(result.items);
          setCount(result.count);
          setPage(result.page);
          setTotalPages(result.totalPages);
        })
        .catch((err) => setError(err instanceof Error ? err.message : 'Could not load worklist.'))
        .finally(() => setLoading(false));
    }, [search, startDate, endDate, type])
  );

  const loadMore = () => {
    if (loadingMore || page >= totalPages) return;
    setLoadingMore(true);
    const dateArgs: [string?, string?] = type ? [undefined, undefined] : [toApiDate(startDate), toApiDate(endDate)];
    getMonitorWorklist(page + 1, search, ...dateArgs, type)
      .then((result) => {
        setItems((prev) => [...prev, ...result.items]);
        setPage(result.page);
        setTotalPages(result.totalPages);
      })
      .catch(() => {})
      .finally(() => setLoadingMore(false));
  };

  return (
    <ScreenGradient style={styles.container}>
      <ScreenHeader title={label ?? 'Worklist'} />

      <View style={[styles.searchWrap, { marginTop: headerHeight + spacing.md }]}>
        <TextField
          icon="search-outline"
          placeholder="Search worklist..."
          value={searchInput}
          onChangeText={setSearchInput}
          autoCapitalize="none"
        />
      </View>

      {type ? null : (
        <View style={styles.filterRow}>
          <View style={styles.filterField}>
            <DateField placeholder="Start date" value={startDate} onChange={setStartDate} />
          </View>
          <View style={styles.filterField}>
            <DateField placeholder="End date" value={endDate} onChange={setEndDate} />
          </View>
        </View>
      )}

      {loading ? (
        <ActivityIndicator color={colors.primaryStart} style={styles.loading} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item, index) =>
            // cart_id is the confirmed id field (matches GET /field/task/:cartId's
            // own response) — cart_monitor_id/id are speculative fallbacks only.
            fieldOf(item, ['cart_id', 'cart_monitor_id', 'id']) ?? String(index)
          }
          contentContainerStyle={styles.content}
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={<Text style={styles.countText}>{count} tasks</Text>}
          ListFooterComponent={loadingMore ? <ActivityIndicator color={colors.primaryStart} /> : null}
          renderItem={({ item }) => {
            const title =
              fieldOf(item, ['media_name', 'title', 'campaignname', 'campaign_name', 'name']) ?? 'Untitled';
            const campaignName = fieldOf(item, ['campaign_name', 'campaignname']);
            const orderNumber = fieldOf(item, ['order_number']);
            const subtitle = fieldOf(item, ['location', 'address', 'media_code']);
            const cartMonitorId = fieldOf(item, ['cart_id', 'cart_monitor_id', 'id']);

            return (
              <Pressable
                onPress={() =>
                  cartMonitorId &&
                  router.push({
                    pathname: '/monitor-task-detail',
                    params: { cartMonitorId },
                  })
                }
              >
                <Card elevated padding={0} style={styles.row}>
                  <View style={styles.iconBadge}>
                    <Ionicons name="document-text-outline" size={20} color={colors.primaryStart} />
                  </View>
                  <View style={styles.info}>
                    <Text style={styles.title} numberOfLines={1}>
                      {title}
                    </Text>
                    {campaignName ? (
                      <Text style={[styles.subtitle, styles.subtitleBold]} numberOfLines={1}>
                        Campaign Name: {campaignName}
                      </Text>
                    ) : null}
                    {orderNumber ? (
                      <Text style={styles.subtitle} numberOfLines={1}>
                        Ref No: {orderNumber}
                      </Text>
                    ) : null}
                    {subtitle ? (
                      <Text style={styles.subtitle} numberOfLines={1}>
                        {subtitle}
                      </Text>
                    ) : null}
                  </View>
                  <View style={styles.chevronWrap}>
                    <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                  </View>
                </Card>
              </Pressable>
            );
          }}
          ListEmptyComponent={<Text style={styles.emptyText}>No records found.</Text>}
        />
      )}
    </ScreenGradient>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'transparent',
    },
    searchWrap: {
      paddingHorizontal: spacing.lg,
      marginBottom: spacing.md,
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
    countText: {
      fontSize: 14,
      color: colors.onBackgroundMuted,
      marginBottom: spacing.md,
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
    subtitle: {
      marginTop: 2,
      fontSize: 13,
      color: colors.textMuted,
    },
    subtitleBold: {
      fontWeight: '700',
      color: colors.text,
    },
    chevronWrap: {
      width: 44,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyText: {
      textAlign: 'center',
      fontSize: 14,
      color: colors.onBackgroundMuted,
      marginTop: spacing.xl,
    },
  });
}
