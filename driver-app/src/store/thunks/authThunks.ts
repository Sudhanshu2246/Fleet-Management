import { createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LoginPayload {
  driverName: string;
  driverPhone: string;
  vehicleNumber: string;
  idToken: string;
}

export const driverLoginThunk = createAsyncThunk(
  'auth/driverLogin',
  async (payload: LoginPayload, { rejectWithValue }) => {
    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL;
      const response = await fetch(`${apiUrl}/api/v1/auth/driver-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        await AsyncStorage.setItem('authToken', data.token);
        await AsyncStorage.setItem('authUser', JSON.stringify(data.user));
        return data;
      } else {
        return rejectWithValue(data.message || 'Login failed');
      }
    } catch (error: any) {
      return rejectWithValue('Network error. Please try again later.');
    }
  }
);
