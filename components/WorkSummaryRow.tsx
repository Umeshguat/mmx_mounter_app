import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import type { WorkSummaryEntry } from '../data/mockData';

const ICONS: Record<WorkSummaryEntry['icon'], keyof typeof Ionicons.glyphMap> = {
  document: 'document-text-outline',
  location: 'location',
  camera: 'camera',
};

const BACKGROUNDS: Record<WorkSummaryEntry['icon'], string> = {
  document: colors.cardBlue,
  location: colors.cardRed,
  camera: '#DEDCFB',
};

const ICON_COLORS: Record<WorkSummaryEntry['icon'], string> = {
  document: colors.primaryStart,
  location: colors.cardRedIcon,
  camera: '#6C5CE7',
};

export function WorkSummaryRow({ entry }: { entry: WorkSummaryEntry }) {
  return (
    <View style={styles.row}>
      <View style={[styles.iconBadge, { backgroundColor: BACKGROUNDS[entry.icon] }]}>
        <Ionicons name={ICONS[entry.icon]} size={20} color={ICON_COLORS[entry.icon]} />
      </View>
      <View style={styles.info}>
        <Text style={styles.title}>{entry.title}</Text>
        <Text style={styles.subtitle}>{entry.subtitle}</Text>
      </View>
      <View style={styles.tag}>
        <Text style={styles.tagText}>{entry.tag}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  info: {
    flex: 1,
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
  tag: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
});
