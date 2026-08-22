import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { spacing } from '../../theme/spacing';
import type { ThemeColors } from '../../theme/colors';
import { TaskListItem } from '../../components/TaskListItem';
import { SidebarMenu } from '../../components/SidebarMenu';
import { Badge } from '../../components/Badge';
import { tasks } from '../../data/mockData';

export default function Tasks() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
    <View style={[styles.container, { paddingTop: insets.top + spacing.lg }]}>
      <View style={styles.topBar}>
        <Pressable onPress={() => setSidebarOpen(true)} hitSlop={10}>
          <Ionicons name="menu" size={26} color={colors.text} />
        </Pressable>
        <View style={styles.topBarActions}>
          <Ionicons name="search" size={22} color={colors.text} style={styles.actionIcon} />
          <View>
            <Ionicons name="options-outline" size={22} color={colors.text} />
            <View style={styles.filterDot}>
              <Badge variant="dot" tone="red" size={7} />
            </View>
          </View>
        </View>
      </View>

      <Text style={styles.title}>My Task</Text>
      <Text style={styles.subtitle}>{tasks.length} tasks</Text>

      {tasks.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconWrap}>
            <Ionicons name="calendar-outline" size={32} color={colors.textFaint} />
          </View>
          <Text style={styles.emptyTitle}>No tasks yet</Text>
          <Text style={styles.emptySubtitle}>New assignments will show up here.</Text>
        </View>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <TaskListItem task={item} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
    <SidebarMenu visible={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: spacing.lg,
    },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.xl,
    },
    topBarActions: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    actionIcon: {
      marginRight: spacing.md,
    },
    filterDot: {
      position: 'absolute',
      top: -2,
      right: -2,
    },
    title: {
      fontSize: 30,
      fontWeight: '800',
      color: colors.text,
    },
    subtitle: {
      marginTop: 2,
      fontSize: 15,
      color: colors.textMuted,
      marginBottom: spacing.lg,
    },
    listContent: {
      paddingBottom: spacing.xl,
    },
    emptyState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingBottom: spacing.xxl,
    },
    emptyIconWrap: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: colors.surfaceMuted,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.md,
    },
    emptyTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: colors.text,
    },
    emptySubtitle: {
      marginTop: spacing.xs,
      fontSize: 14,
      color: colors.textMuted,
    },
  });
}
