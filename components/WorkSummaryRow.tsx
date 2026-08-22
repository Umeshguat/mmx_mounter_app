import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Badge } from './Badge';
import { Card } from './Card';
import { useTheme } from '../context/ThemeContext';
import { radius, spacing } from '../theme/spacing';
import type { ThemeColors } from '../theme/colors';
import type { WorkSummaryEntry } from '../data/mockData';

const ICONS: Record<WorkSummaryEntry['icon'], keyof typeof Ionicons.glyphMap> = {
  document: 'document-text-outline',
  location: 'location',
  camera: 'camera',
};

const TAG_TONES: Record<WorkSummaryEntry['icon'], 'blue' | 'green' | 'orange' | 'red'> = {
  document: 'blue',
  location: 'red',
  camera: 'orange',
};

export function WorkSummaryRow({ entry }: { entry: WorkSummaryEntry }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const backgrounds: Record<WorkSummaryEntry['icon'], string> = {
    document: colors.cardBlue,
    location: colors.cardRed,
    camera: '#DEDCFB',
  };

  const iconColors: Record<WorkSummaryEntry['icon'], string> = {
    document: colors.primaryStart,
    location: colors.cardRedIcon,
    camera: '#6C5CE7',
  };

  return (
    <Card elevated style={styles.row}>
      <View style={[styles.iconBadge, { backgroundColor: backgrounds[entry.icon] }]}>
        <Ionicons name={ICONS[entry.icon]} size={20} color={iconColors[entry.icon]} />
      </View>
      <View style={styles.info}>
        <Text style={styles.title}>{entry.title}</Text>
        <Text style={styles.subtitle}>{entry.subtitle}</Text>
      </View>
      <Badge label={entry.tag} tone={TAG_TONES[entry.icon]} />
    </Card>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
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
  });
}
