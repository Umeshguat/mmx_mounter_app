import { useMemo } from 'react';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { spacing } from '../theme/spacing';
import type { ThemeColors } from '../theme/colors';

export function ScreenHeader({ title }: { title: string }) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={[styles.row, { marginTop: insets.top + spacing.lg }]}>
      <Pressable onPress={() => router.back()} hitSlop={10} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color={colors.text} />
      </Pressable>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    row: {
      marginBottom: spacing.lg,
    },
    backButton: {
      marginBottom: spacing.md,
      alignSelf: 'flex-start',
    },
    title: {
      fontSize: 28,
      fontWeight: '800',
      color: colors.text,
    },
  });
}
