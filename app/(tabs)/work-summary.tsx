import { useMemo, useState } from 'react';
import { Modal, Pressable, SectionList, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { radius, spacing } from '../../theme/spacing';
import type { ThemeColors } from '../../theme/colors';
import { WorkSummaryRow } from '../../components/WorkSummaryRow';
import { SidebarMenu } from '../../components/SidebarMenu';
import { workSummary, type WorkSummaryEntry } from '../../data/mockData';

const TAG_OPTIONS: WorkSummaryEntry['tag'][] = ['Note added', 'Location added', 'Image added'];

export default function WorkSummary() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeTag, setActiveTag] = useState<WorkSummaryEntry['tag'] | null>(null);

  const sections = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return workSummary
      .map((group) => ({
        title: group.date,
        data: group.entries.filter((entry) => {
          const matchesQuery =
            !normalizedQuery ||
            entry.title.toLowerCase().includes(normalizedQuery) ||
            entry.subtitle.toLowerCase().includes(normalizedQuery);
          const matchesTag = !activeTag || entry.tag === activeTag;
          return matchesQuery && matchesTag;
        }),
      }))
      .filter((group) => group.data.length > 0);
  }, [query, activeTag]);

  const closeSearch = () => {
    setSearchOpen(false);
    setQuery('');
  };

  return (
    <>
    <View style={[styles.container, { paddingTop: insets.top + spacing.lg }]}>
      <View style={styles.topBar}>
        <Pressable onPress={() => setSidebarOpen(true)} hitSlop={10}>
          <Ionicons name="menu" size={26} color={colors.text} />
        </Pressable>
        <View style={styles.topBarActions}>
          <Pressable onPress={() => setSearchOpen((o) => !o)} hitSlop={10} style={styles.actionIcon}>
            <Ionicons name={searchOpen ? 'close' : 'search'} size={22} color={colors.text} />
          </Pressable>
          <Pressable onPress={() => setFilterOpen(true)} hitSlop={10}>
            <Ionicons name="options-outline" size={22} color={colors.text} />
            {activeTag ? <View style={styles.filterDot} /> : null}
          </Pressable>
        </View>
      </View>

      <Text style={styles.title}>Work Summary</Text>

      {searchOpen ? (
        <View style={styles.searchRow}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by title or location"
            placeholderTextColor={colors.textFaint}
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
          {query ? (
            <Pressable onPress={closeSearch} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </Pressable>
          ) : null}
        </View>
      ) : null}

      {activeTag ? (
        <View style={styles.activeFilterRow}>
          <View style={styles.activeFilterChip}>
            <Text style={styles.activeFilterText}>{activeTag}</Text>
            <Pressable onPress={() => setActiveTag(null)} hitSlop={8}>
              <Ionicons name="close" size={14} color={colors.primaryStart} />
            </Pressable>
          </View>
        </View>
      ) : null}

      {sections.length === 0 ? (
        <Text style={styles.emptyText}>No results found.</Text>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <WorkSummaryRow entry={item} />}
          renderSectionHeader={({ section }) => <Text style={styles.sectionHeader}>{section.title}</Text>}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
        />
      )}
    </View>

    <Modal visible={filterOpen} transparent animationType="slide" onRequestClose={() => setFilterOpen(false)}>
      <Pressable style={styles.backdrop} onPress={() => setFilterOpen(false)}>
        <View style={styles.sheet}>
          <Text style={styles.sheetTitle}>Filter by</Text>
          <Pressable
            style={styles.option}
            onPress={() => {
              setActiveTag(null);
              setFilterOpen(false);
            }}
          >
            <Text style={styles.optionText}>All</Text>
            {!activeTag ? <Ionicons name="checkmark-circle" size={20} color={colors.primaryStart} /> : null}
          </Pressable>
          {TAG_OPTIONS.map((tag) => (
            <Pressable
              key={tag}
              style={styles.option}
              onPress={() => {
                setActiveTag(tag);
                setFilterOpen(false);
              }}
            >
              <Text style={styles.optionText}>{tag}</Text>
              {activeTag === tag ? <Ionicons name="checkmark-circle" size={20} color={colors.primaryStart} /> : null}
            </Pressable>
          ))}
        </View>
      </Pressable>
    </Modal>

    <SidebarMenu visible={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </>
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
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: colors.primaryStart,
    },
    title: {
      fontSize: 30,
      fontWeight: '800',
      color: colors.text,
      marginBottom: spacing.lg,
    },
    searchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.inputBackground,
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
      height: 48,
      marginBottom: spacing.md,
    },
    searchInput: {
      flex: 1,
      marginLeft: spacing.sm,
      fontSize: 15,
      color: colors.text,
    },
    activeFilterRow: {
      flexDirection: 'row',
      marginBottom: spacing.md,
    },
    activeFilterChip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.cardBlue,
      borderRadius: radius.pill,
      paddingHorizontal: spacing.sm,
      paddingVertical: 6,
    },
    activeFilterText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.primaryStart,
      marginRight: spacing.xs,
    },
    emptyText: {
      marginTop: spacing.xl,
      textAlign: 'center',
      fontSize: 14,
      color: colors.textMuted,
    },
    sectionHeader: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textMuted,
      marginBottom: spacing.sm,
      marginTop: spacing.xs,
    },
    listContent: {
      paddingBottom: spacing.xl,
    },
    backdrop: {
      flex: 1,
      backgroundColor: colors.overlay,
      justifyContent: 'flex-end',
    },
    sheet: {
      width: '100%',
      backgroundColor: colors.background,
      borderTopLeftRadius: radius.lg,
      borderTopRightRadius: radius.lg,
      padding: spacing.lg,
    },
    sheetTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: spacing.md,
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    optionText: {
      fontSize: 16,
      color: colors.text,
    },
  });
}
