import { createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const fetchDriverProfileThunk = createAsyncThunk(
  'profile/fetchDriverProfile',
  async (_, { rejectWithValue }) => {
    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL;
      const token = await AsyncStorage.getItem('authToken');

      if (!token) {
        return rejectWithValue('No token found');
      }

      const response = await fetch(`${apiUrl}/api/v1/driver-profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return data.driver;
      } else {
        return rejectWithValue(data.message || 'Failed to fetch profile');
      }
    } catch (error: any) {
      return rejectWithValue('Network error. Please try again later.');
    }
  }
);

export const updateDriverProfileThunk = createAsyncThunk(
  'profile/updateDriverProfile',
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL;
      const token = await AsyncStorage.getItem('authToken');

      if (!token) {
        return rejectWithValue('No token found');
      }

      const response = await fetch(`${apiUrl}/api/v1/driver-profile`, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return data.driver;
      } else {
        return rejectWithValue(data.message || 'Failed to update profile');
      }
    } catch (error: any) {
      console.error('Update Profile Error:', error);
      return rejectWithValue('Network error. Please try again later.');
    }
  }
);
