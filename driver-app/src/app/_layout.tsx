import { DarkTheme, ThemeProvider } from 'expo-router';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { LogBox } from 'react-native';
import { Provider, useDispatch } from 'react-redux';
import { store, AppDispatch } from '../store';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { restoreSession } from '../store/slices/authSlice';
import { StatusBar } from 'expo-status-bar';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

LogBox.ignoreLogs([
  'SafeAreaView has been deprecated',
]);

SplashScreen.preventAutoHideAsync();

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        const userStr = await AsyncStorage.getItem('authUser');
        
        if (token && userStr) {
          dispatch(restoreSession({ token, user: JSON.parse(userStr) }));
        }
      } catch (error) {
        console.error("Failed to load session", error);
      } finally {
        setIsReady(true);
      }
    };
    loadSession();
  }, [dispatch]);

  if (!isReady) return null;

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <ThemeProvider value={DarkTheme}>
        <SafeAreaProvider>
          <StatusBar style="light" />
          <SafeAreaView style={{ flex: 1, backgroundColor: '#101211' }}>
            <AnimatedSplashOverlay />
            <AuthInitializer>
              <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }} />
            </AuthInitializer>
          </SafeAreaView>
        </SafeAreaProvider>
      </ThemeProvider>
    </Provider>
  );
}
