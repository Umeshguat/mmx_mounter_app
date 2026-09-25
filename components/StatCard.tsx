import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { radius, spacing } from '../theme/spacing';
import type { ThemeColors } from '../theme/colors';

type Props = {
  label: string;
  value: number;
  icon: keyof typeof Ionicons.glyphMap;
  background: string;
  iconColor: string;
  onPress?: () => void;
  // Smaller 3-per-row card, for dashboards with many stat cards.
  compact?: boolean;
};

export function StatCard({ label, value, icon, background, iconColor, onPress, compact }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        compact && styles.cardCompact,
        { backgroundColor: background },
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <View style={[styles.iconWrap, compact && styles.iconWrapCompact, { backgroundColor: colors.surfaceElevated }]}>
        <Ionicons name={icon} size={compact ? 18 : 24} color={iconColor} />
      </View>
      <Text style={[styles.label, compact && styles.labelCompact]} numberOfLines={2}>
        {label}
      </Text>
      <Text style={[styles.value, compact && styles.valueCompact]}>{value}</Text>
    </Pressable>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    card: {
      flexBasis: '48%',
      borderRadius: radius.lg,
      padding: spacing.md,
      marginBottom: spacing.md,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 10,
      elevation: 2,
    },
    cardCompact: {
      flexBasis: '31%',
      padding: spacing.sm,
    },
    pressed: {
      opacity: 0.85,
    },
    iconWrap: {
      width: 40,
      height: 40,
      borderRadius: radius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconWrapCompact: {
      width: 30,
      height: 30,
      borderRadius: radius.sm,
    },
    label: {
      marginTop: spacing.md,
      fontSize: 14,
      color: colors.text,
    },
    labelCompact: {
      marginTop: spacing.xs,
      fontSize: 11,
    },
    value: {
      marginTop: spacing.xs,
      fontSize: 28,
      fontWeight: '800',
      color: colors.text,
    },
    valueCompact: {
      marginTop: 2,
      fontSize: 20,
    },
  });
}
