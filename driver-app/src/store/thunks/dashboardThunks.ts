import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../index';

export const fetchDashboardDataThunk = createAsyncThunk(
  'dashboard/fetchData',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const token = state.auth.token;

      if (!token) {
        return rejectWithValue('No token found');
      }

      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5001';
      const response = await fetch(`${apiUrl}/api/v1/drivers/dashboard`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return data.data; // contains assignment, vehicle, trip
      } else {
        return rejectWithValue(data.message || 'Failed to fetch dashboard data');
      }
    } catch (error: any) {
      return rejectWithValue('Network error while fetching dashboard data.');
    }
  }
);
