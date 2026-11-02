import { createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LoginPayload {
  driverName: string;
  driverPhone: string;
  vehicleNumber: string;
  vehicleType?: string;
  idToken?: string;
}

export const driverLoginThunk = createAsyncThunk(
  'auth/driverLogin',
  async (payload: LoginPayload) => {
    const user = {
      name: payload.driverName,
      phone: payload.driverPhone,
      vehicleNumber: payload.vehicleNumber,
      vehicleType: payload.vehicleType || 'truck',
    };
    const token = 'LOCAL_AUTH_TOKEN_' + Date.now();

    await AsyncStorage.setItem('authToken', token);
    await AsyncStorage.setItem('authUser', JSON.stringify(user));

    return {
      success: true,
      token,
      user,
    };
  }
);
