import { useEffect } from 'react';
import { useRouter, useRootNavigationState } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { View, ActivityIndicator } from 'react-native';
import { Colors } from '../constants/Colors';

export default function Index() {
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();
  const token = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    if (!rootNavigationState?.key) return;

    if (token) {
      router.replace('/(tabs)');
    } else {
      router.replace('/(auth)/login');
    }
  }, [rootNavigationState?.key, token]);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color={Colors.accent} />
    </View>
  );
}
