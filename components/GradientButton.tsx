import { useMemo } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { radius, spacing } from '../theme/spacing';
import type { ThemeColors } from '../theme/colors';

type Props = {
  label: string;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function GradientButton({ label, onPress, icon, loading, disabled, style }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const gradientColors = [colors.primaryStart, colors.primaryEnd] as const;

  return (
    <Pressable onPress={onPress} disabled={disabled || loading} style={style}>
      {({ pressed }) => (
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.button, (pressed || disabled) && styles.pressed]}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <>
              <Text style={styles.label}>{label}</Text>
              {icon ? (
                <View style={styles.iconRight}>
                  <Ionicons name={icon} size={20} color={colors.white} />
                </View>
              ) : null}
            </>
          )}
        </LinearGradient>
      )}
    </Pressable>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    button: {
      height: 56,
      borderRadius: radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      shadowColor: colors.primaryStart,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.28,
      shadowRadius: 12,
      elevation: 5,
    },
    pressed: {
      opacity: 0.85,
    },
    label: {
      color: colors.white,
      fontSize: 17,
      fontWeight: '700',
      letterSpacing: 0.2,
    },
    iconRight: {
      position: 'absolute',
      right: spacing.lg,
      top: 0,
      bottom: 0,
      justifyContent: 'center',
    },
  });
}
