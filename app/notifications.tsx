import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { ScreenHeader } from '../components/ScreenHeader';
import { notifications, type NotificationItem } from '../data/mockData';

function Row({ item }: { item: NotificationItem }) {
  return (
    <View style={[styles.row, !item.read && styles.rowUnread]}>
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
  );
}

export default function Notifications() {
  return (
    <View style={styles.container}>
      <ScreenHeader title="Notification" />

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <Row item={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
  },
  listContent: {
    paddingBottom: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  rowUnread: {
    backgroundColor: colors.surfaceMuted,
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
