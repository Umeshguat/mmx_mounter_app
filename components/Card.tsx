import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { radius, spacing } from '../theme/spacing';
import type { ThemeColors } from '../theme/colors';

type CardProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  elevated?: boolean;
  tint?: 'surface' | 'muted' | 'none';
  padding?: number;
};

export function Card({ children, style, elevated = false, tint = 'surface', padding = spacing.md }: CardProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  return (
    <View
      style={[
        styles.base,
        tint === 'muted' && styles.muted,
        tint === 'none' && styles.none,
        elevated && styles.elevated,
        { padding },
        style,
      ]}
    >
      {children}
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    base: {
      backgroundColor: colors.surfaceElevated,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    muted: {
      backgroundColor: colors.surfaceMuted,
      borderColor: colors.surfaceMuted,
    },
    none: {
      backgroundColor: 'transparent',
      borderWidth: 0,
    },
    elevated: {
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.1,
      shadowRadius: 16,
      elevation: 4,
    },
  });
}
