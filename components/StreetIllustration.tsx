import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { spacing } from '../theme/spacing';
import type { ThemeColors } from '../theme/colors';

function Building({
  height,
  width,
  styles,
}: {
  height: number;
  width: number;
  styles: ReturnType<typeof createStyles>;
}) {
  return <View style={[styles.building, { height, width }]} />;
}

function Worker({
  size = 30,
  colors,
  styles,
}: {
  size?: number;
  colors: ThemeColors;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={styles.worker}>
      <Ionicons name="person" size={size} color={colors.text} />
      <View style={styles.helmet} />
    </View>
  );
}

export function StreetIllustration() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <View style={styles.sun} />
      <View style={styles.swoosh} />

      <View style={styles.skyline}>
        <Building height={70} width={40} styles={styles} />
        <Building height={110} width={54} styles={styles} />
        <Building height={60} width={36} styles={styles} />
        <Ionicons name="leaf-outline" size={22} color={colors.border} style={styles.tree} />
        <Building height={40} width={30} styles={styles} />
        <Building height={80} width={46} styles={styles} />
        <Ionicons name="leaf-outline" size={22} color={colors.border} style={styles.tree} />
        <Building height={95} width={50} styles={styles} />
      </View>

      <View style={styles.ground} />

      <View style={styles.figures}>
        <Worker size={26} colors={colors} styles={styles} />
        <Worker size={22} colors={colors} styles={styles} />
        <View style={styles.bench} />
        <Ionicons name="cog-outline" size={16} color={colors.cardRedIcon} style={styles.cone} />
        <Worker size={24} colors={colors} styles={styles} />
      </View>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
  container: {
    height: 150,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  sun: {
    position: 'absolute',
    top: 4,
    right: 24,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.surfaceMuted,
  },
  swoosh: {
    position: 'absolute',
    top: 34,
    left: -10,
    width: '80%',
    height: 1,
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    transform: [{ rotate: '-8deg' }],
  },
  skyline: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xs,
  },
  building: {
    backgroundColor: colors.surfaceMuted,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  tree: {
    marginBottom: 2,
  },
  ground: {
    height: 1,
    backgroundColor: colors.border,
    marginTop: 8,
  },
  figures: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-evenly',
    paddingTop: 6,
  },
  worker: {
    alignItems: 'center',
  },
  helmet: {
    position: 'absolute',
    top: -2,
    width: 10,
    height: 6,
    borderRadius: 5,
    backgroundColor: colors.primaryStart,
  },
  bench: {
    width: 30,
    height: 12,
    borderWidth: 1.5,
    borderColor: colors.textFaint,
    borderRadius: 2,
  },
  cone: {
    marginBottom: 2,
  },
  });
}
