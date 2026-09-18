import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';

export default function ExercisesLayout() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}>
      <Stack.Screen name="theory" options={{ title: 'Teoria', headerShown: false }} />
      <Stack.Screen name="quest_1" options={{ title: 'Questão 1', headerShown: false }} />
      <Stack.Screen name="matching" options={{ title: 'Matching', headerShown: false }} />
      <Stack.Screen name="builder" options={{ title: 'Builder', headerShown: false }} />
      <Stack.Screen name="flashcard" options={{ title: 'Flashcard', headerShown: false }} />
    </Stack>
  );
}
