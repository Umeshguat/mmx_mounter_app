import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

function Letter({ char, color }: { char: string; color: string }) {
  return <Text style={[styles.letter, { color }]}>{char}</Text>;
}

export function GrowWordmark() {
  return (
    <View style={styles.row}>
      <Letter char="G" color={colors.logoNavy} />
      <Letter char="R" color={colors.logoNavy} />
      <Letter char="O" color={colors.logoRed} />
      <Letter char="W" color={colors.logoNavy} />
    </View>
  );
}

export function MmxWordmark() {
  return (
    <View style={styles.row}>
      <Letter char="M" color={colors.logoNavy} />
      <Letter char="M" color={colors.logoRed} />
      <Letter char="X" color={colors.logoNavy} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
  letter: {
    fontSize: 40,
    fontWeight: '800',
    lineHeight: 44,
  },
});
