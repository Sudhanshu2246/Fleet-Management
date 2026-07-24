import { Redirect, useRootNavigationState } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

export default function Index() {
  const rootNavigationState = useRootNavigationState();
  const token = useSelector((state: RootState) => state.auth.token);

  if (!rootNavigationState?.key) return null;

  if (token) {
    return <Redirect href="/(tabs)" />;
  }

  // Redirect to the login flow
  return <Redirect href="/(auth)/login" />;
}
