import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ActivityIndicator, MD3DarkTheme, MD3LightTheme, PaperProvider } from 'react-native-paper';
import 'react-native-reanimated';

import { AuthProvider, useAuth } from '@/hooks/use-auth';
import { useColorScheme } from '@/hooks/use-color-scheme';


function RootNavigator() {
  const { session, role, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {

  if (loading) return;

  const currentGroup = segments[0]; // 'index' | '(auth)' | '(admin)' | '(teacher)' | '(student)' | '(guest)' | 'modal'

  if (!session) {
    if (currentGroup !== '(auth)') {
      router.replace('/(auth)/login');
    }
    return;
  }

  // Logged in — figure out which group they should be in
  let targetGroup;
  if (role === 'admin') targetGroup = '(admin)';
  else if (role === 'teacher') targetGroup = '(teacher)';
  else if (role === 'student') targetGroup = '(student)';
  else targetGroup = '(guest)';

  if (currentGroup !== targetGroup) {
    if (role === 'admin') router.replace('/admin-dashboard');
    else if (role === 'teacher') router.replace('/teacher-dashboard');
    else if (role === 'student') router.replace('/student-dashboard');
    else router.replace('/guest-dashboard');
  }
}, [session, role, loading, segments]);

  return (
    <>
      <Stack>
  <Stack.Screen name="index" options={{ headerShown: false }} />
  <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
  <Stack.Screen name="(auth)/signup" options={{ headerShown: false }} />
  <Stack.Screen name="(admin)/admin-dashboard" options={{ headerShown: false }} />
  <Stack.Screen name="(teacher)/teacher-dashboard" options={{ headerShown: false }} />
  <Stack.Screen name="(student)/student-dashboard" options={{ headerShown: false }} />
  <Stack.Screen name="(guest)/guest-dashboard" options={{ headerShown: false }} />
  <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
</Stack>

      {loading && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.6)',
          }}>
          <ActivityIndicator size="large" />
        </View>
      )}
    </>
  );
}


export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <PaperProvider theme={isDark ? MD3DarkTheme : MD3LightTheme}>
          <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
            <RootNavigator />
            <StatusBar style="auto" />
          </ThemeProvider>
        </PaperProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}