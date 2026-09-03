import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AnimatedTabScreen from '@/components/animated-tab-screen';

export default function HistoryScreen() {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  return (
    <AnimatedTabScreen 
      style={styles.container}
      onRefresh={onRefresh}
      refreshing={refreshing}
      contentContainerStyle={{ justifyContent: 'center', alignItems: 'center' }}
    >
      <Text style={styles.text}>Trip History</Text>
    </AnimatedTabScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 20, fontWeight: 'bold' }
});
