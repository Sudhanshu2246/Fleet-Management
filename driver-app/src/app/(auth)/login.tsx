import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Dropdown, DropdownOption } from '../../components/ui/Dropdown';
import { useAppDispatch, useAppSelector } from '../../store';
import { driverLoginThunk } from '../../store/thunks/authThunks';

const VEHICLE_TYPES: DropdownOption[] = [
  { value: "truck", label: "Truck", icon: "local-shipping" },
  { value: "van", label: "Van", icon: "airport-shuttle" },
  { value: "bike", label: "Bike", icon: "directions-bike" },
  { value: "shuttle", label: "Shuttle", icon: "airport-shuttle" },
  { value: "car", label: "Car", icon: "directions-car" },
  { value: "bus", label: "Bus", icon: "directions-bus" },
  { value: "suv", label: "SUV", icon: "directions-car" },
  { value: "motorcycle", label: "Motorcycle", icon: "two-wheeler" },
  { value: "pickup", label: "Pickup Truck", icon: "local-shipping" },
  { value: "minivan", label: "Minivan", icon: "airport-shuttle" },
];

export default function LoginScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((state) => state.auth);
  
  const [driverName, setDriverName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  
  const handleLogin = async () => {
    if (!driverName || !phoneNumber || !vehicleNumber) {
      Alert.alert('Please fill in all required fields');
      return;
    }

    try {
      await dispatch(driverLoginThunk({
        driverName,
        driverPhone: phoneNumber,
        vehicleNumber,
        vehicleType,
      })).unwrap();

      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Login error:', error);
      Alert.alert('Login failed', typeof error === 'string' ? error : 'An error occurred during login.');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1, backgroundColor: Colors.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Logo & Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <View style={{ 
              width: 32, height: 32, borderRadius: 6,
              backgroundColor: Colors.accent,
              alignItems: 'center', justifyContent: 'center' 
            }}>
              <Feather name="truck" size={16} color={Colors.accentText} />
            </View>
            <Text style={{ fontWeight: '800', fontSize: 16, color: Colors.text }}>
              FleetIQ Driver
            </Text>
          </View>
          
          <Text style={styles.title}>Welcome Back</Text>

          <View style={styles.formContainer}>
            <Input 
              label="Driver Name"
              placeholder="John Doe"
              value={driverName}
              onChangeText={setDriverName}
              icon={<Feather name="user" size={15} color={Colors.textMuted} />}
              required
            />

            <Input 
              label="Phone Number"
              placeholder="+1 (555) 000-0000"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              icon={<Feather name="phone" size={15} color={Colors.textMuted} />}
              required
            />

            <Input 
              label="Vehicle Number"
              placeholder="e.g. ABC-1234"
              value={vehicleNumber}
              onChangeText={setVehicleNumber}
              icon={<Feather name="hash" size={15} color={Colors.textMuted} />}
              required
            />

            <Dropdown
              label="Type of Vehicle"
              placeholder="Select vehicle type"
              value={vehicleType}
              options={VEHICLE_TYPES}
              onSelect={setVehicleType}
              icon={<Feather name="truck" size={15} color={Colors.textMuted} />}
              required
            />

            <View style={styles.buttonContainer}>
              <Button title="Start Driving" onPress={handleLogin} loading={isLoading} />
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  content: {
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
    paddingVertical: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  formContainer: {
    width: '100%',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  buttonContainer: {
    marginTop: 12,
  }
});
