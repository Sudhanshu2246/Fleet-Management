import { View, Text, StyleSheet } from 'react-native';
import AnimatedTabScreen from '@/components/animated-tab-screen';

export default function HistoryScreen() {
  return (
    <AnimatedTabScreen style={styles.container}>
      <Text style={styles.text}>Trip History</Text>
    </AnimatedTabScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 20, fontWeight: 'bold' }
});
