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
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5001';
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

export const driverLogoutThunk = createAsyncThunk(
  'auth/driverLogout',
  async (_, { getState }) => {
    try {
      const state: any = getState();
      const token = state.auth.token || await AsyncStorage.getItem('authToken');
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5001';

      if (token) {
        await fetch(`${apiUrl}/api/v1/auth/driver-logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
      }
    } catch (e) {
      console.warn("Logout request error:", e);
    } finally {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('authUser');
    }
  }
);

// Function called by GPS watcher when driver is logged in
export const sendDriverLocationUpdate = async (
  token: string,
  payload: {
    latitude: number;
    longitude: number;
    speed?: number;
    heading?: number;
    address?: string;
  }
) => {
  if (!token) return null;
  try {
    const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5001';
    const res = await fetch(`${apiUrl}/api/v1/drivers/update-location`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (err) {
    return null;
  }
};

