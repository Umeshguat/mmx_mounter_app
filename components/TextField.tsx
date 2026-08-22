import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { radius, spacing } from '../theme/spacing';
import type { ThemeColors } from '../theme/colors';

type Props = TextInputProps & {
  icon: keyof typeof Ionicons.glyphMap;
  secure?: boolean;
};

export function TextField({ icon, secure, style, ...rest }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [hidden, setHidden] = useState(!!secure);

  return (
    <View style={styles.wrapper}>
      <Ionicons name={icon} size={20} color={colors.textMuted} style={styles.leftIcon} />
      <TextInput
        style={[styles.input, style]}
        placeholderTextColor={colors.textFaint}
        secureTextEntry={hidden}
        {...rest}
      />
      {secure ? (
        <Pressable onPress={() => setHidden((h) => !h)} hitSlop={10}>
          <Ionicons name={hidden ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textMuted} />
        </Pressable>
      ) : null}
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    wrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.inputBackground,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: spacing.md,
      height: 56,
    },
    leftIcon: {
      marginRight: spacing.sm,
    },
    input: {
      flex: 1,
      fontSize: 16,
      color: colors.text,
    },
  });
}
