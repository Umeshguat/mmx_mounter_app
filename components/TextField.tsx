import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';

type Props = TextInputProps & {
  icon: keyof typeof Ionicons.glyphMap;
  secure?: boolean;
};

export function TextField({ icon, secure, style, ...rest }: Props) {
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

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
    borderRadius: radius.md,
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
