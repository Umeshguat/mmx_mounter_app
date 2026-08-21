import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';

function Person() {
  return (
    <View style={styles.personWrap}>
      <Ionicons name="person" size={64} color={colors.text} />
      <View style={styles.groundLine} />
      <Ionicons name="leaf-outline" size={16} color={colors.border} style={styles.leaf} />
    </View>
  );
}

export function VendorHandoffIllustration() {
  return (
    <View style={styles.container}>
      <View style={styles.checkBadge}>
        <Ionicons name="checkmark" size={16} color={colors.primaryStart} />
      </View>

      <View style={styles.row}>
        <Person />

        <View style={styles.card}>
          <View style={styles.cardDot} />
          <View style={styles.cardLines}>
            <View style={[styles.cardLine, { width: '90%' }]} />
            <View style={[styles.cardLine, { width: '55%' }]} />
          </View>
        </View>

        <Person />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xxl,
  },
  checkBadge: {
    alignSelf: 'center',
    width: 30,
    height: 30,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    zIndex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  personWrap: {
    alignItems: 'center',
  },
  groundLine: {
    width: 46,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.border,
    marginTop: spacing.sm,
  },
  leaf: {
    position: 'absolute',
    bottom: -4,
    left: -18,
    transform: [{ rotate: '20deg' }],
  },
  card: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.sm,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
  },
  cardDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.cardBlueIcon,
    opacity: 0.35,
    marginRight: spacing.sm,
  },
  cardLines: {
    flex: 1,
  },
  cardLine: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.cardBlueIcon,
    opacity: 0.6,
    marginBottom: spacing.xs,
  },
});
