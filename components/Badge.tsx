import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { radius, spacing } from '../theme/spacing';
import type { ThemeColors } from '../theme/colors';

type BadgeProps =
  | { variant?: 'pill'; label: string; tone?: 'blue' | 'green' | 'orange' | 'red'; size?: never }
  | { variant: 'dot'; tone?: 'blue' | 'green' | 'orange' | 'red'; label?: never; size?: number };

export function Badge(props: BadgeProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const tone = props.tone ?? 'blue';
  const toneColors = {
    blue: { bg: colors.cardBlue, fg: colors.cardBlueIcon },
    green: { bg: colors.cardGreen, fg: colors.cardGreenIcon },
    orange: { bg: colors.cardOrange, fg: colors.cardOrangeIcon },
    red: { bg: colors.cardRed, fg: colors.cardRedIcon },
  }[tone];

  if (props.variant === 'dot') {
    const size = props.size ?? 10;
    return (
      <View
        style={[
          styles.dot,
          { width: size, height: size, borderRadius: size / 2, backgroundColor: toneColors.fg },
        ]}
      />
    );
  }

  return (
    <View style={[styles.pill, { backgroundColor: toneColors.bg }]}>
      <Text style={[styles.pillText, { color: toneColors.fg }]}>{props.label}</Text>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    pill: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: radius.pill,
      alignSelf: 'flex-start',
    },
    pillText: {
      fontSize: 12,
      fontWeight: '700',
    },
    dot: {
      borderWidth: 2,
      borderColor: colors.background,
    },
  });
}
