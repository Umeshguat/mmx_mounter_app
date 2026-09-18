import { Image, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { spacing } from '../theme/spacing';

function Letter({ char, color }: { char: string; color: string }) {
  return <Text style={[styles.letter, { color }]}>{char}</Text>;
}

export function GrowWordmark() {
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      <Letter char="G" color={colors.logoNavy} />
      <Letter char="R" color={colors.logoNavy} />
      <Letter char="O" color={colors.logoRed} />
      <Letter char="W" color={colors.logoNavy} />
    </View>
  );
}

const SIZE_MAP = {
  // Sidebar panel is ~300px wide (minus padding), so this is scaled down
  // from the `md` size below, proportionally, to avoid clipping.
  sm: { width: 230, height: 128 },
  md: { width: 296, height: 165 },
  lg: { width: 208, height: 110 },
} as const;

const BADGE_VERTICAL_PADDING = spacing.sm;

export const WORDMARK_ALLOCATED_HEIGHT: Record<keyof typeof SIZE_MAP, number> = {
  sm: SIZE_MAP.sm.height + BADGE_VERTICAL_PADDING * 2,
  md: SIZE_MAP.md.height + BADGE_VERTICAL_PADDING * 2,
  lg: SIZE_MAP.lg.height + BADGE_VERTICAL_PADDING * 2,
};

type MmxWordmarkProps = {
  size?: keyof typeof SIZE_MAP;
};

export function MmxWordmark({ size = 'md' }: MmxWordmarkProps) {
  const dims = SIZE_MAP[size];

  return (
    <Image
      source={require('../assets/images/mmx-cloud-badge.png')}
      style={{ width: dims.width, height: dims.height }}
      resizeMode="contain"
      accessible
      accessibilityLabel="MMX - my media xchange"
    />
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
  letter: {
    fontSize: 46,
    fontWeight: '800',
    lineHeight: 50,
  },
});
