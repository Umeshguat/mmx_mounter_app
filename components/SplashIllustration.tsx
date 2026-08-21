import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';

function FloatingCards() {
  return (
    <View style={styles.cardsRow}>
      <View style={[styles.card, styles.cardFront]}>
        <View style={styles.cardHeaderRow}>
          <View style={[styles.swatch, { backgroundColor: colors.cardBlueIcon }]} />
          <View style={styles.cardHeaderLine} />
        </View>
        <View style={styles.cardBodyLine} />
        <View style={styles.cardBodyLine} />
        <View style={[styles.cardBodyLine, { width: '60%' }]} />
      </View>

      <View style={[styles.card, styles.cardBack]}>
        <View style={styles.grid}>
          <View style={[styles.swatch, { backgroundColor: colors.cardBlueIcon }]} />
          <View style={[styles.swatch, { backgroundColor: colors.border }]} />
        </View>
        <View style={[styles.swatch, styles.pinkSwatch, { backgroundColor: colors.cardRedIcon }]} />
      </View>
    </View>
  );
}

export function SplashIllustration() {
  return (
    <View style={styles.container}>
      <FloatingCards />

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

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: spacing.xl,
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginBottom: spacing.lg,
  },
  card: {
    width: 92,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.sm,
  },
  cardFront: {
    marginRight: -spacing.md,
    zIndex: 1,
  },
  cardBack: {
    marginBottom: 18,
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
