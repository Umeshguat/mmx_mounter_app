import { useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform, Pressable, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';

type Props = {
  placeholder: string;
  value: Date | null;
  onChange: (date: Date) => void;
};

function formatDate(date: Date) {
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function DateField({ placeholder, value, onChange }: Props) {
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

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.inputBackground,
    borderRadius: radius.md,
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
