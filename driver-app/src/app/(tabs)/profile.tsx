import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { useRouter } from 'expo-router';
import AnimatedTabScreen from '@/components/animated-tab-screen';
import { Button } from '../../components/ui/Button';

export default function ProfileScreen() {
  const router = useRouter();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
    router.replace('/(auth)/login');
  };

  return (
    <AnimatedTabScreen style={styles.container}>
      <Text style={styles.text}>Profile</Text>
      
      <View style={styles.buttonContainer}>
        <Button 
          title="Logout" 
          onPress={handleLogout} 
        />
      </View>
    </AnimatedTabScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  text: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  buttonContainer: { width: '100%', marginTop: 20 }
});
