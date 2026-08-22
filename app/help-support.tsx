import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { ScreenHeader } from '../components/ScreenHeader';
import { faqs, supportContact, type FaqItem } from '../data/mockData';

function FaqRow({ item }: { item: FaqItem }) {
  const [open, setOpen] = useState(false);

  return (
    <Pressable style={styles.faqRow} onPress={() => setOpen((o) => !o)}>
      <View style={styles.faqHeader}>
        <Text style={styles.faqQuestion}>{item.question}</Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
      </View>
      {open ? <Text style={styles.faqAnswer}>{item.answer}</Text> : null}
    </Pressable>
  );
}

export default function HelpSupport() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ScreenHeader title="Help & Support" />

      <View style={styles.contactCard}>
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
      </View>

      <Text style={styles.sectionTitle}>Frequently asked questions</Text>
      {faqs.map((item) => (
        <FaqRow key={item.id} item={item} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  contactCard: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.lg,
    padding: spacing.md,
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
  faqRow: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: spacing.md,
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
