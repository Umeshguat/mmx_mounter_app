import { useMemo } from 'react';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { spacing } from '../theme/spacing';
import type { ThemeColors } from '../theme/colors';

export const SCREEN_HEADER_CONTENT_HEIGHT = 56;

export function useScreenHeaderHeight() {
  const insets = useSafeAreaInsets();
  return insets.top + SCREEN_HEADER_CONTENT_HEIGHT;
}

export function ScreenHeader({ title }: { title: string }) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const headerHeight = insets.top + SCREEN_HEADER_CONTENT_HEIGHT;

  return (
    <View style={[styles.row, { paddingTop: insets.top, height: headerHeight }]}>
      <Pressable onPress={() => router.back()} hitSlop={10} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color={colors.text} />
      </Pressable>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    row: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      backgroundColor: colors.headerOverlay,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backButton: {
      marginRight: spacing.md,
    },
    title: {
      flex: 1,
      fontSize: 20,
      fontWeight: '800',
      color: colors.text,
    },
  });
}
