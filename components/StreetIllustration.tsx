import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

function Building({ height, width }: { height: number; width: number }) {
  return <View style={[styles.building, { height, width }]} />;
}

function Worker({ size = 30 }: { size?: number }) {
  return (
    <View style={styles.worker}>
      <Ionicons name="person" size={size} color={colors.text} />
      <View style={styles.helmet} />
    </View>
  );
}

export function StreetIllustration() {
  return (
    <View style={styles.container}>
      <View style={styles.sun} />
      <View style={styles.swoosh} />

      <View style={styles.skyline}>
        <Building height={70} width={40} />
        <Building height={110} width={54} />
        <Building height={60} width={36} />
        <Ionicons name="leaf-outline" size={22} color={colors.border} style={styles.tree} />
        <Building height={40} width={30} />
        <Building height={80} width={46} />
        <Ionicons name="leaf-outline" size={22} color={colors.border} style={styles.tree} />
        <Building height={95} width={50} />
      </View>

      <View style={styles.ground} />

      <View style={styles.figures}>
        <Worker size={26} />
        <Worker size={22} />
        <View style={styles.bench} />
        <Ionicons name="cog-outline" size={16} color={colors.cardRedIcon} style={styles.cone} />
        <Worker size={24} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
