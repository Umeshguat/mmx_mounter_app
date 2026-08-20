import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';

type Props = {
  label: string;
  value: number;
  icon: keyof typeof Ionicons.glyphMap;
  background: string;
  iconColor: string;
  onPress?: () => void;
};

export function StatCard({ label, value, icon, background, iconColor, onPress }: Props) {
  return (
    <Pressable style={[styles.card, { backgroundColor: background }]} onPress={onPress}>
      <Ionicons name={icon} size={26} color={iconColor} />
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexBasis: '48%',
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
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
