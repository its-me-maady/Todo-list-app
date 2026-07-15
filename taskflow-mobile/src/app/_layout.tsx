import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ title: 'Sign In', presentation: 'modal' }} />
      <Stack.Screen name="register" options={{ title: 'Create Account', presentation: 'modal' }} />
    </Stack>
  );
}
