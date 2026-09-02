import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { Colors } from '@/constants/theme';
import { useColorScheme } from 'react-native';

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

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
            <Feather name="layers" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="quest_1"
        options={{
          title: 'Questão 1',
          tabBarIcon: ({ color, size }) => (
            <Feather name="code" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="matching"
        options={{
          title: 'Matching',
          tabBarIcon: ({ color, size }) => (
            <Feather name="git-merge" size={size} color={color} />
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
