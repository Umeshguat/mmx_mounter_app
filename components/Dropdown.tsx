import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';

type Option = { id: string; name: string };

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  placeholder: string;
  value: Option | null;
  options: Option[];
  onSelect: (option: Option) => void;
};

export function Dropdown({ icon, placeholder, value, options, onSelect }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable style={styles.wrapper} onPress={() => setOpen(true)}>
        <Ionicons name={icon} size={20} color={colors.textMuted} style={styles.leftIcon} />
        <Text style={[styles.text, !value && styles.placeholder]} numberOfLines={1}>
          {value ? value.name : placeholder}
        </Text>
        <View style={styles.chevronCircle}>
          <Ionicons name="chevron-down" size={16} color={colors.white} />
        </View>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>{placeholder}</Text>
            <FlatList
              data={options}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.option}
                  onPress={() => {
                    onSelect(item);
                    setOpen(false);
                  }}
                >
                  <Text style={styles.optionText}>{item.name}</Text>
                  {value?.id === item.id ? (
                    <Ionicons name="checkmark-circle" size={20} color={colors.primaryStart} />
                  ) : null}
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </>
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
  text: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  placeholder: {
    color: colors.textFaint,
  },
  chevronCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.textFaint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(20,24,40,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
    maxHeight: '60%',
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  optionText: {
    fontSize: 16,
    color: colors.text,
  },
});
