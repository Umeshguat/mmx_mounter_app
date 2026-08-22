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
};

export function StatCard({ label, value, icon, background, iconColor, onPress }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Pressable
      style={({ pressed }) => [styles.card, { backgroundColor: background }, pressed && styles.pressed]}
      onPress={onPress}
    >
      <View style={[styles.iconWrap, { backgroundColor: colors.surfaceElevated }]}>
        <Ionicons name={icon} size={24} color={iconColor} />
      </View>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
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
    label: {
      marginTop: spacing.md,
      fontSize: 14,
      color: colors.text,
    },
    value: {
      marginTop: spacing.xs,
      fontSize: 28,
      fontWeight: '800',
      color: colors.text,
    },
  });
}
