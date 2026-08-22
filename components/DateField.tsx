import { useMemo, useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform, Pressable, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { radius, spacing } from '../theme/spacing';
import type { ThemeColors } from '../theme/colors';

type Props = {
  placeholder: string;
  value: Date | null;
  onChange: (date: Date) => void;
};

function formatDate(date: Date) {
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function DateField({ placeholder, value, onChange }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable style={styles.wrapper} onPress={() => setOpen(true)}>
        <Text style={[styles.text, !value && styles.placeholder]}>{value ? formatDate(value) : placeholder}</Text>
        <Ionicons name="calendar" size={20} color={colors.primaryStart} />
      </Pressable>

      {open ? (
        <DateTimePicker
          value={value ?? new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={(event, selected) => {
            setOpen(Platform.OS === 'ios');
            if (event.type === 'set' && selected) {
              onChange(selected);
            }
            if (Platform.OS === 'android') setOpen(false);
          }}
        />
      ) : null}
    </>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    wrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.inputBackground,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: spacing.md,
      height: 56,
    },
    text: {
      fontSize: 16,
      color: colors.text,
    },
    placeholder: {
      color: colors.textFaint,
    },
  });
}
