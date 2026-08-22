import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';

type Props = {
  notes: string[];
  onAdd: (note: string) => void;
  onRemove: (index: number) => void;
};

export function NotesList({ notes, onAdd, onRemove }: Props) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');

  const confirmAdd = () => {
    if (draft.trim().length === 0) return;
    onAdd(draft.trim());
    setDraft('');
    setOpen(false);
  };

  return (
    <View>
      <View style={styles.header}>
        <Text style={styles.label}>Add notes</Text>
        <Pressable style={styles.addButton} onPress={() => setOpen(true)}>
          <Ionicons name="add" size={18} color={colors.white} />
        </Pressable>
      </View>

      {notes.map((note, index) => (
        <View key={`${note}-${index}`} style={styles.row}>
          <Text style={styles.noteText} numberOfLines={2}>
            {note}
          </Text>
          <Pressable onPress={() => onRemove(index)} hitSlop={8}>
            <Ionicons name="trash-outline" size={18} color={colors.danger} />
          </Pressable>
        </View>
      ))}

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.sheetTitle}>Add note</Text>
            <TextInput
              style={styles.input}
              placeholder="Type a note"
              placeholderTextColor={colors.textFaint}
              value={draft}
              onChangeText={setDraft}
              multiline
              autoFocus
            />
            <Pressable style={styles.confirmButton} onPress={confirmAdd}>
              <Text style={styles.confirmText}>Add</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  addButton: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  noteText: {
    flex: 1,
    marginRight: spacing.sm,
    fontSize: 14,
    color: colors.textMuted,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(20,24,40,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  sheet: {
    width: '100%',
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  input: {
    minHeight: 80,
    backgroundColor: colors.inputBackground,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 15,
    color: colors.text,
    textAlignVertical: 'top',
    marginBottom: spacing.md,
  },
  confirmButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primaryStart,
    borderRadius: radius.md,
  },
  confirmText: {
    color: colors.white,
    fontWeight: '700',
  },
});
