import { useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { GradientButton } from './GradientButton';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function RateUsModal({ visible, onClose }: Props) {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  const reset = () => {
    setRating(0);
    setFeedback('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = () => {
    if (rating === 0) return;
    handleClose();
    Alert.alert('Thank you!', 'Your rating has been submitted.');
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <Pressable style={styles.backdrop} onPress={handleClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>Rate Us</Text>
          <Text style={styles.subtitle}>How was your experience with MMX?</Text>

          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((value) => (
              <Pressable key={value} onPress={() => setRating(value)} hitSlop={6}>
                <Ionicons
                  name={value <= rating ? 'star' : 'star-outline'}
                  size={34}
                  color={colors.day}
                  style={styles.star}
                />
              </Pressable>
            ))}
          </View>

          <TextInput
            style={styles.input}
            placeholder="Tell us more (optional)"
            placeholderTextColor={colors.textFaint}
            value={feedback}
            onChangeText={setFeedback}
            multiline
          />

          <GradientButton label="Submit" onPress={handleSubmit} disabled={rating === 0} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: spacing.xs,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  star: {
    marginHorizontal: 4,
  },
  input: {
    minHeight: 80,
    backgroundColor: colors.inputBackground,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 15,
    color: colors.text,
    textAlignVertical: 'top',
    marginBottom: spacing.lg,
  },
});
