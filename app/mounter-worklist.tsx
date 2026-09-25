import { useCallback, useEffect, useMemo, useState } from 'react';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { radius, spacing } from '../theme/spacing';
import type { ThemeColors } from '../theme/colors';
import { Card } from '../components/Card';
import { TextField } from '../components/TextField';
import { ScreenHeader, useScreenHeaderHeight } from '../components/ScreenHeader';
import { ScreenGradient } from '../components/ScreenGradient';
import { getMounterWorklist, type MounterWorklistType } from '../services/api';

const SEARCH_DEBOUNCE_MS = 400;

function fieldOf(item: any, keys: string[]): string | undefined {
  for (const key of keys) {
    if (item?.[key] !== undefined && item[key] !== null && item[key] !== '') {
      return String(item[key]);
    }
  }
  return undefined;
}

export default function MounterWorklist() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const headerHeight = useScreenHeaderHeight();
  const { type, label } = useLocalSearchParams<{ type: MounterWorklistType; label: string }>();

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
      if (!type) return;
      setLoading(true);
      setError(null);
      getMounterWorklist(type, 1, search)
        .then((result) => {
          setItems(result.items);
          setCount(result.count);
          setTotalPages(result.totalPages);
          setPage(result.page);
        })
        .catch((err) => setError(err instanceof Error ? err.message : 'Could not load worklist.'))
        .finally(() => setLoading(false));
    }, [type, search])
  );

  const loadMore = () => {
    if (!type || loadingMore || page >= totalPages) return;
    setLoadingMore(true);
    getMounterWorklist(type, page + 1, search)
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

      {loading ? (
        <ActivityIndicator color={colors.primaryStart} style={styles.loading} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item, index) => fieldOf(item, ['cart_id', 'id', 'taskid', 'task_id']) ?? String(index)}
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
            const subtitle = fieldOf(item, ['location', 'address', 'vendor_name', 'vendorname', 'media_code']);
            const date = fieldOf(item, ['start_date', 'date', 'display_date', 'addedon']);
            const status = fieldOf(item, ['cart_status', 'status']);
            const isDone = status === 'completed' || status === 'done';
            const cartId = fieldOf(item, ['cart_id', 'id']);

            return (
              <Pressable
                onPress={() =>
                  cartId && router.push({ pathname: '/task-detail', params: { cartId, type } })
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
                    <Text style={styles.subtitle} numberOfLines={1}>
                      {subtitle ?? date}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: isDone ? colors.success : colors.day }]}>
                    <Ionicons name={isDone ? 'checkmark' : 'time-outline'} size={18} color={colors.white} />
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
    statusBadge: {
      width: 56,
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
