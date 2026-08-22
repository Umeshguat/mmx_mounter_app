import { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { radius, spacing } from '../theme/spacing';
import type { ThemeColors } from '../theme/colors';
import { ScreenHeader } from '../components/ScreenHeader';
import { Card } from '../components/Card';
import { notifications, type NotificationItem } from '../data/mockData';

function Row({ item, colors, styles }: { item: NotificationItem; colors: ThemeColors; styles: ReturnType<typeof createStyles> }) {
  return (
    <Card tint={item.read ? 'surface' : 'muted'} style={styles.row}>
      <View style={styles.rowContent}>
        <View style={styles.iconBadge}>
          <Ionicons name={item.icon} size={20} color={colors.primaryStart} />
        </View>
        <View style={styles.info}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.message}>{item.message}</Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>
        {!item.read ? <View style={styles.dot} /> : null}
      </View>
    </Card>
  );
}

export default function Notifications() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <ScreenHeader title="Notification" />

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <Row item={item} colors={colors} styles={styles} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: spacing.lg,
    },
    listContent: {
      paddingBottom: spacing.xl,
    },
    row: {
      marginBottom: spacing.md,
    },
    rowContent: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    iconBadge: {
      width: 40,
      height: 40,
      borderRadius: radius.md,
      backgroundColor: colors.cardBlue,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.md,
    },
    info: {
      flex: 1,
    },
    title: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
    },
    message: {
      marginTop: 2,
      fontSize: 13,
      color: colors.textMuted,
    },
    time: {
      marginTop: spacing.xs,
      fontSize: 12,
      color: colors.textFaint,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.primaryStart,
      marginTop: 4,
    },
  });
}
