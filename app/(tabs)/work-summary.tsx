import { SectionList, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { WorkSummaryRow } from '../../components/WorkSummaryRow';
import { workSummary } from '../../data/mockData';

export default function WorkSummary() {
  const sections = workSummary.map((group) => ({ title: group.date, data: group.entries }));

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Ionicons name="menu" size={26} color={colors.text} />
        <View style={styles.topBarActions}>
          <Ionicons name="search" size={22} color={colors.text} style={styles.actionIcon} />
          <View>
            <Ionicons name="options-outline" size={22} color={colors.text} />
            <View style={styles.filterDot} />
          </View>
        </View>
      </View>

      <Text style={styles.title}>Work Summary</Text>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <WorkSummaryRow entry={item} />}
        renderSectionHeader={({ section }) => <Text style={styles.sectionHeader}>{section.title}</Text>}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
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
});
