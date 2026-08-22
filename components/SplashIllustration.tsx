import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { radius, spacing } from '../theme/spacing';
import type { ThemeColors } from '../theme/colors';

function DottedArrow({
  style,
  rotate,
  colors,
  styles,
}: {
  style: object;
  rotate: string;
  colors: ThemeColors;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={[styles.dottedArrowWrap, style, { transform: [{ rotate }] }]}>
      <Ionicons name="arrow-up" size={11} color={colors.textFaint} />
      <View style={styles.dottedLine} />
    </View>
  );
}

function FloatingCards({ colors, styles }: { colors: ThemeColors; styles: ReturnType<typeof createStyles> }) {
  return (
    <View style={styles.cardArea}>
      <View style={[styles.card, styles.cardStack]} />

      <View style={[styles.card, styles.cardBack]}>
        <View style={styles.grid}>
          <View style={[styles.swatch, { backgroundColor: colors.cardBlueIcon }]} />
          <View style={[styles.swatch, { backgroundColor: colors.border }]} />
        </View>
        <View style={[styles.swatch, styles.pinkSwatch, { backgroundColor: colors.cardRedIcon }]} />
      </View>

      <View style={[styles.card, styles.cardFront]}>
        <View style={styles.cardHeaderRow}>
          <View style={[styles.swatch, { backgroundColor: colors.cardBlueIcon }]} />
          <View style={styles.cardHeaderLine} />
        </View>
        <View style={styles.cardBodyLine} />
        <View style={styles.cardBodyLine} />
        <View style={[styles.cardBodyLine, { width: '60%' }]} />
      </View>

      <DottedArrow style={styles.arrowTopLeft} rotate="-50deg" colors={colors} styles={styles} />
      <DottedArrow style={styles.arrowBottomRight} rotate="130deg" colors={colors} styles={styles} />
    </View>
  );
}

export function SplashIllustration() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <FloatingCards colors={colors} styles={styles} />

      <View style={styles.peopleRow}>
        <View style={styles.person}>
          <Ionicons name="person-circle" size={56} color={colors.cardBlueIcon} />
          <View style={styles.standingBody} />
          <View style={styles.heldCard} />
        </View>

        <View style={styles.person}>
          <Ionicons name="person-circle" size={56} color={colors.cardBlueIcon} />
          <View style={styles.deskBody} />
          <View style={styles.desk} />
        </View>
      </View>

      <View style={styles.groundLine} />
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
  container: {
    width: '100%',
  },
  cardArea: {
    height: 128,
    marginBottom: spacing.lg,
  },
  card: {
    position: 'absolute',
    width: 92,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.sm,
  },
  cardStack: {
    top: 10,
    left: '50%',
    marginLeft: 6,
    width: 78,
    height: 56,
    opacity: 0.6,
  },
  cardBack: {
    top: 0,
    left: '18%',
  },
  cardFront: {
    top: 34,
    left: '38%',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  swatch: {
    width: 16,
    height: 16,
    borderRadius: 3,
  },
  cardHeaderLine: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.text,
    marginLeft: spacing.xs,
  },
  cardBodyLine: {
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: 6,
  },
  grid: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
    gap: spacing.xs,
  },
  pinkSwatch: {
    width: 16,
    height: 16,
  },
  dottedArrowWrap: {
    position: 'absolute',
    alignItems: 'center',
  },
  dottedLine: {
    width: 1,
    height: 22,
    borderLeftWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.textFaint,
  },
  arrowTopLeft: {
    top: 4,
    left: 8,
  },
  arrowBottomRight: {
    bottom: 4,
    right: 8,
  },
  peopleRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
  },
  person: {
    alignItems: 'center',
  },
  standingBody: {
    width: 34,
    height: 46,
    borderRadius: radius.sm,
    backgroundColor: colors.text,
    marginTop: -4,
  },
  heldCard: {
    position: 'absolute',
    bottom: 8,
    right: -14,
    width: 20,
    height: 26,
    borderRadius: 3,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.cardBlueIcon,
    transform: [{ rotate: '18deg' }],
  },
  deskBody: {
    width: 34,
    height: 38,
    borderRadius: radius.sm,
    backgroundColor: colors.text,
    marginTop: -4,
  },
  desk: {
    width: 46,
    height: 8,
    borderRadius: 2,
    backgroundColor: colors.cardBlueIcon,
    opacity: 0.35,
    marginTop: 4,
  },
  groundLine: {
    height: 1,
    backgroundColor: colors.border,
    marginTop: spacing.lg,
  },
  });
}
