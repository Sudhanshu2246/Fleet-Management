import { createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const fetchVehicleDocumentsThunk = createAsyncThunk(
  'documents/fetchVehicleDocuments',
  async (_, { rejectWithValue }) => {
    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL;
      const token = await AsyncStorage.getItem('authToken');

      if (!token) {
        return rejectWithValue('No token found');
      }

      const response = await fetch(`${apiUrl}/api/v1/driver-profile/vehicle-documents`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return data; // returning the whole payload
      } else {
        return rejectWithValue(data.message || 'Failed to fetch vehicle documents');
      }
    } catch (error: any) {
      return rejectWithValue('Network error. Please try again later.');
    }
  }
);
