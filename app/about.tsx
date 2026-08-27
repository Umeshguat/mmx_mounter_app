import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { spacing } from '../theme/spacing';
import type { ThemeColors } from '../theme/colors';
import { Card } from '../components/Card';
import { ScreenHeader, useScreenHeaderHeight } from '../components/ScreenHeader';
import { MmxWordmark, WORDMARK_ALLOCATED_HEIGHT } from '../components/MmxWordmark';
import { aboutInfo } from '../data/mockData';

export default function About() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const headerHeight = useScreenHeaderHeight();

  return (
    <View style={styles.container}>
      <ScreenHeader title="About MMX" />

      <ScrollView contentContainerStyle={[styles.content, { paddingTop: headerHeight + spacing.lg }]}>
      <View style={styles.logoBlock}>
        <View style={styles.logoWrap}>
          <MmxWordmark />
        </View>
        <Text style={styles.version}>Version {aboutInfo.version}</Text>
      </View>

      <Text style={styles.description}>{aboutInfo.description}</Text>

      <Card elevated tint="surface" style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Ionicons name="business-outline" size={18} color={colors.primaryStart} />
          <Text style={styles.infoText}>{aboutInfo.company}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="globe-outline" size={18} color={colors.primaryStart} />
          <Text style={styles.infoText}>{aboutInfo.website}</Text>
        </View>
      </Card>
      </ScrollView>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.xl,
    },
    logoBlock: {
      alignItems: 'flex-start',
      marginBottom: spacing.lg,
    },
    logoWrap: {
      height: WORDMARK_ALLOCATED_HEIGHT.md,
      justifyContent: 'center',
    },
    version: {
      marginTop: spacing.xs,
      fontSize: 14,
      color: colors.textMuted,
    },
    description: {
      fontSize: 15,
      color: colors.text,
      lineHeight: 22,
      marginBottom: spacing.xl,
    },
    infoCard: {
      gap: spacing.xs,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.xs,
    },
    infoText: {
      marginLeft: spacing.sm,
      fontSize: 14,
      color: colors.text,
    },
  });
}
