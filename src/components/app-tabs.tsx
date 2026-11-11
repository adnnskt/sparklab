import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { Colors } from '@/constants/theme';
import { useColorScheme, type ColorValue } from 'react-native';

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  // `tabBarIcon` can provide numeric or null colors, which `Feather` does not accept.
  const iconColor = (color: ColorValue) =>
    typeof color === 'number' || color == null ? colors.text : color;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#FF9600',
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.backgroundElement,
        },
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Trilha',
          tabBarIcon: ({ color, size }) => (
            <Feather name="layers" size={size} color={iconColor(color)} />
          ),
        }}
      />
      <Tabs.Screen
        name="lab"
        options={{
          title: 'Lab',
          tabBarIcon: ({ color, size }) => (
            <Feather name="code" size={size} color={iconColor(color)} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
