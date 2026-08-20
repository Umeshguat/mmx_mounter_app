import { router, Tabs } from 'expo-router';
import { StyleSheet, View, type ColorValue } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

function TabIcon(name: keyof typeof Ionicons.glyphMap) {
  return ({ color, size }: { color: ColorValue; size: number }) => (
    <Ionicons name={name} size={size} color={color as string} />
  );
}

function AddButton() {
  return (
    <View style={styles.addButton}>
      <Ionicons name="add" size={28} color={colors.white} />
    </View>
  );
}

export default function TabsLayout() {
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
            router.push('/task-form');
          },
        }}
      />
      <Tabs.Screen name="work-summary" options={{ tabBarIcon: TabIcon('document-text-outline') }} />
      <Tabs.Screen name="profile" options={{ tabBarIcon: TabIcon('person-outline') }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 68,
    paddingTop: 10,
    paddingBottom: 14,
    borderTopColor: colors.border,
  },
  addButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primaryStart,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
});
