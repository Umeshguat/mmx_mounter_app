import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import type { Task } from '../data/mockData';

export function TaskListItem({ task }: { task: Task }) {
  return (
    <Link href={{ pathname: '/task-form', params: { taskId: task.id } }} asChild>
      <Pressable style={styles.row}>
        <View style={styles.iconBadge}>
          <Ionicons name="document-text-outline" size={20} color={colors.primaryStart} />
        </View>
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>
            {task.title}
          </Text>
          <Text style={styles.date}>{task.date}</Text>
        </View>
        <View style={styles.badges}>
          {task.photoTypes.map((type) => (
            <View
              key={type}
              style={[styles.badge, { backgroundColor: type === 'day' ? colors.day : colors.night }]}
            >
              <Ionicons name={type === 'day' ? 'sunny' : 'moon'} size={18} color={colors.white} />
            </View>
          ))}
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.cardBlue,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.md,
    alignSelf: 'center',
  },
  info: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  date: {
    marginTop: 2,
    fontSize: 13,
    color: colors.textMuted,
  },
  badges: {
    flexDirection: 'column',
  },
  badge: {
    width: 56,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
