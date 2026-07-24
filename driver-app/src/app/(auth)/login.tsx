import React, { useState, useRef } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome5, Feather } from '@expo/vector-icons';
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
  { value: "tractor", label: "Tractor", icon: "agriculture" },
  { value: "trailer", label: "Trailer", icon: "rv-hookup" },
  { value: "camper", label: "Camper", icon: "rv-hookup" },
  { value: "forklift", label: "Forklift", icon: "precision-manufacturing" },
  { value: "ambulance", label: "Ambulance", icon: "medical-services" },
  { value: "firetruck", label: "Fire Truck", icon: "local-fire-department" },
  { value: "police", label: "Police Car", icon: "local-police" },
  { value: "boat", label: "Boat", icon: "directions-boat" },
  { value: "helicopter", label: "Helicopter", icon: "flight" },
  { value: "airplane", label: "Airplane", icon: "flight" },
  { value: "drone", label: "Drone", icon: "airplanemode-active" },
  { value: "scooter", label: "Scooter", icon: "electric-scooter" },
  { value: "bicycle", label: "Bicycle", icon: "directions-bike" },
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
        idToken: "TEST_TOKEN" // Bypassing Firebase OTP as planned
      })).unwrap();

      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Login error:', error);
      Alert.alert('Login failed', typeof error === 'string' ? error : 'Network error. Please try again later.');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1, backgroundColor: '#FAFAFA' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Logo & Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 24 }}>
            <View style={{ 
              width: 32, height: 32, borderRadius: 8, 
              backgroundColor: Colors.gold, 
              alignItems: 'center', justifyContent: 'center' 
            }}>
              <FontAwesome5 name="truck" size={14} color="#fff" />
            </View>
            <Text style={{ fontWeight: '800', fontSize: 16, color: '#111827' }}>
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
              icon={<FontAwesome5 name="user" size={15} color="#6B7280" />}
              required
            />

            <Input 
              label="Phone Number"
              placeholder="+1 (555) 000-0000"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              icon={<Feather name="phone" size={15} color="#6B7280" />}
              required
            />

            <Input 
              label="Vehicle Number"
              placeholder="e.g. ABC-1234"
              value={vehicleNumber}
              onChangeText={setVehicleNumber}
              icon={<Feather name="hash" size={15} color="#6B7280" />}
              required
            />

            <Dropdown
              label="Type of Vehicle"
              placeholder="Select vehicle type"
              value={vehicleType}
              options={VEHICLE_TYPES}
              onSelect={setVehicleType}
              icon={<FontAwesome5 name="truck" size={15} color="#6B7280" />}
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
    padding: 24,
    justifyContent: 'center',
  },
  content: {
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 32,
    letterSpacing: -0.5,
  },
  formContainer: {
    width: '100%',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  phoneContainer: {
    marginBottom: 16,
  },
  buttonContainer: {
    marginTop: 16,
  }
});
