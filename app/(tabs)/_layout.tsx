import { router, Tabs } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, type ColorValue } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { gradients } from '../../theme/colors';
import type { ThemeColors } from '../../theme/colors';

// The tab bar is rendered by the navigator as its own layer, separate from
// each screen's own ScreenGradient — without this it falls back to a plain
// black system background instead of matching the app's purple gradient.
function TabBarBackground() {
  return (
    <LinearGradient colors={gradients.background} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
  );
}

function TabIcon(name: keyof typeof Ionicons.glyphMap) {
  return ({ color }: { color: ColorValue; size: number }) => (
    <Ionicons name={name} size={26} color={color as string} />
  );
}

export default function TabsLayout() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.onBackgroundIcon,
        tabBarInactiveTintColor: colors.onBackgroundIconMuted,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
        tabBarBackground: TabBarBackground,
        sceneStyle: { backgroundColor: 'transparent' },
      }}
    >
      <Tabs.Screen name="index" options={{ tabBarIcon: TabIcon('home') }} />
      <Tabs.Screen
        name="tasks"
        options={{ tabBarIcon: TabIcon('calendar') }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            router.push({ pathname: '/mounter-worklist', params: { type: 'today', label: "Today's Work" } });
          },
        }}
      />
      <Tabs.Screen
        name="work-summary"
        options={{ tabBarIcon: TabIcon('desktop') }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            router.push({
              pathname: '/mounter-worklist',
              params: { type: 'mounting_removal', label: 'Mounting Removal' },
            });
          },
        }}
      />
      <Tabs.Screen name="profile" options={{ tabBarIcon: TabIcon('person') }} />
    </Tabs>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    tabBar: {
      height: 76,
      paddingTop: 12,
      paddingBottom: 14,
      backgroundColor: 'transparent',
      borderTopWidth: 0,
    },
  });
}
