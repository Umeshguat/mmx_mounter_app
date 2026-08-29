import { router, Tabs } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, type ColorValue } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { gradients } from '../../theme/colors';
import type { ThemeColors } from '../../theme/colors';

function TabIcon(name: keyof typeof Ionicons.glyphMap) {
  return ({ color, size }: { color: ColorValue; size: number }) => (
    <Ionicons name={name} size={size} color={color as string} />
  );
}

function AddButton() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <LinearGradient
      colors={gradients.primary}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.addButton}
    >
      <Ionicons name="add" size={32} color={colors.white} />
    </LinearGradient>
  );
}

export default function TabsLayout() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primaryStart,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen name="index" options={{ tabBarIcon: TabIcon('home-outline') }} />
      <Tabs.Screen name="tasks" options={{ tabBarIcon: TabIcon('calendar-outline') }} />
      <Tabs.Screen
        name="add"
        options={{
          tabBarIcon: AddButton,
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            router.push('/(tabs)/tasks');
          },
        }}
      />
      <Tabs.Screen name="work-summary" options={{ tabBarIcon: TabIcon('document-text-outline') }} />
      <Tabs.Screen name="profile" options={{ tabBarIcon: TabIcon('person-outline') }} />
    </Tabs>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    tabBar: {
      height: 76,
      paddingTop: 12,
      paddingBottom: 14,
      backgroundColor: colors.surfaceElevated,
      borderTopColor: colors.border,
    },
    addButton: {
      width: 60,
      height: 60,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 8,
      marginBottom: 12,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 10,
      elevation: 5,
    },
  });
}
