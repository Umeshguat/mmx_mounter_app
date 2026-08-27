import { useMemo, useRef, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { radius, spacing } from '../theme/spacing';
import type { ThemeColors } from '../theme/colors';

type Option = { id: string; name: string };

type Anchor = { x: number; y: number; width: number; height: number };

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  placeholder: string;
  value: Option | null;
  options: Option[];
  onSelect: (option: Option) => void;
  searchable?: boolean;
};

const PANEL_MAX_HEIGHT = 260;

export function Dropdown({ icon, placeholder, value, options, onSelect, searchable = false }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { height: windowHeight } = useWindowDimensions();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const triggerRef = useRef<View>(null);

  const filteredOptions = useMemo(() => {
    if (!searchable || !query.trim()) return options;
    const q = query.trim().toLowerCase();
    return options.filter((option) => option.name.toLowerCase().includes(q));
  }, [options, query, searchable]);

  const openDropdown = () => {
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      setAnchor({ x, y, width, height });
      setOpen(true);
    });
  };

  const closeDropdown = () => {
    setOpen(false);
    setQuery('');
  };

  return (
    <>
      <View ref={triggerRef} collapsable={false}>
        <Pressable style={styles.wrapper} onPress={openDropdown}>
          <Ionicons name={icon} size={20} color={colors.textMuted} style={styles.leftIcon} />
          <Text style={[styles.text, !value && styles.placeholder]} numberOfLines={1}>
            {value ? value.name : placeholder}
          </Text>
          <View style={styles.chevronCircle}>
            <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={16} color={colors.white} />
          </View>
        </Pressable>
      </View>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={closeDropdown}
      >
        <Pressable style={styles.backdrop} onPress={closeDropdown}>
          {anchor ? (
            <View
              style={[
                styles.panel,
                anchor.y + anchor.height + PANEL_MAX_HEIGHT + spacing.lg > windowHeight
                  ? { bottom: windowHeight - anchor.y + spacing.xs, left: anchor.x, width: anchor.width }
                  : { top: anchor.y + anchor.height + spacing.xs, left: anchor.x, width: anchor.width },
              ]}
              onStartShouldSetResponder={() => true}
            >
              {searchable ? (
                <View style={styles.searchRow}>
                  <Ionicons name="search" size={16} color={colors.textMuted} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search vendor..."
                    placeholderTextColor={colors.textFaint}
                    value={query}
                    onChangeText={setQuery}
                    autoFocus
                  />
                </View>
              ) : null}
              <FlatList
                data={filteredOptions}
                keyExtractor={(item) => item.id}
                keyboardShouldPersistTaps="handled"
                style={styles.optionList}
                ListEmptyComponent={searchable ? <Text style={styles.emptyText}>No matches found</Text> : null}
                renderItem={({ item }) => (
                  <Pressable
                    style={styles.option}
                    onPress={() => {
                      onSelect(item);
                      closeDropdown();
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
          ) : null}
        </Pressable>
      </Modal>
    </>
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
    },
    panel: {
      position: 'absolute',
      backgroundColor: colors.surfaceElevated,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      maxHeight: PANEL_MAX_HEIGHT,
      overflow: 'hidden',
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.18,
      shadowRadius: 20,
      elevation: 12,
    },
    searchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    searchInput: {
      flex: 1,
      fontSize: 15,
      color: colors.text,
      paddingVertical: 4,
    },
    optionList: {
      flexGrow: 0,
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    optionText: {
      fontSize: 16,
      color: colors.text,
    },
    emptyText: {
      padding: spacing.md,
      fontSize: 14,
      color: colors.textMuted,
      textAlign: 'center',
    },
  });
}
