import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { radius, spacing } from '../theme/spacing';
import type { ThemeColors } from '../theme/colors';
import { ScreenHeader, useScreenHeaderHeight } from '../components/ScreenHeader';
import { Card } from '../components/Card';
import { faqs, supportContact, type FaqItem } from '../data/mockData';

function FaqRow({
  item,
  colors,
  styles,
  isLast,
}: {
  item: FaqItem;
  colors: ThemeColors;
  styles: ReturnType<typeof createStyles>;
  isLast: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Pressable style={[styles.faqRow, isLast && styles.faqRowLast]} onPress={() => setOpen((o) => !o)}>
      <View style={styles.faqHeader}>
        <Text style={styles.faqQuestion}>{item.question}</Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
      </View>
      {open ? <Text style={styles.faqAnswer}>{item.answer}</Text> : null}
    </Pressable>
  );
}

export default function HelpSupport() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const headerHeight = useScreenHeaderHeight();

  return (
    <View style={styles.container}>
      <ScreenHeader title="Help & Support" />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: headerHeight + spacing.lg }]}
        showsVerticalScrollIndicator={false}
      >
      <Card tint="muted" style={styles.contactCard}>
        <View style={styles.contactRow}>
          <Ionicons name="call-outline" size={18} color={colors.primaryStart} />
          <Text style={styles.contactText}>{supportContact.phone}</Text>
        </View>
        <View style={styles.contactRow}>
          <Ionicons name="mail-outline" size={18} color={colors.primaryStart} />
          <Text style={styles.contactText}>{supportContact.email}</Text>
        </View>
        <View style={styles.contactRow}>
          <Ionicons name="time-outline" size={18} color={colors.primaryStart} />
          <Text style={styles.contactText}>{supportContact.hours}</Text>
        </View>
      </Card>

      <Text style={styles.sectionTitle}>Frequently asked questions</Text>
      <Card tint="surface" style={styles.faqCard}>
        {faqs.map((item, index) => (
          <FaqRow key={item.id} item={item} colors={colors} styles={styles} isLast={index === faqs.length - 1} />
        ))}
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
    contactCard: {
      marginBottom: spacing.xl,
    },
    contactRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.xs,
    },
    contactText: {
      marginLeft: spacing.sm,
      fontSize: 14,
      color: colors.text,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      marginBottom: spacing.md,
    },
    faqCard: {
      paddingVertical: 0,
      paddingHorizontal: spacing.md,
    },
    faqRow: {
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingVertical: spacing.md,
    },
    faqRowLast: {
      borderBottomWidth: 0,
    },
    faqHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    faqQuestion: {
      flex: 1,
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
      marginRight: spacing.sm,
    },
    faqAnswer: {
      marginTop: spacing.sm,
      fontSize: 14,
      color: colors.textMuted,
      lineHeight: 20,
    },
  });
}
