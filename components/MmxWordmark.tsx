import { Image, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { radius, spacing } from '../theme/spacing';
import type { ThemeColors } from '../theme/colors';

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
  sm: { width: 96, height: 30 },
  md: { width: 148, height: 46 },
  lg: { width: 208, height: 64 },
} as const;

type MmxWordmarkProps = {
  size?: keyof typeof SIZE_MAP;
};

export function MmxWordmark({ size = 'md' }: MmxWordmarkProps) {
  const { isDark, colors } = useTheme();
  const dims = SIZE_MAP[size];
  const badgeStyles = createBadgeStyles(colors);

  const image = (
    <Image
      source={require('../assets/images/mmx-logo.png')}
      style={{ width: dims.width, height: dims.height }}
      resizeMode="contain"
      accessible
      accessibilityLabel="MMX - my media xchange"
    />
  );

  if (!isDark) return image;

  return <View style={badgeStyles.badge}>{image}</View>;
}

function createBadgeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    badge: {
      backgroundColor: colors.white,
      borderRadius: radius.md,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      alignSelf: 'flex-start',
    },
  });
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
