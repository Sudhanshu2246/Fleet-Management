import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../index';

export const fetchDashboardDataThunk = createAsyncThunk(
  'dashboard/fetchData',
  async (_, { getState }) => {
    try {
      const state = getState() as RootState;
      const token = state.auth.token;

      if (!token) return null;

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
        return data.data;
      }
      return null;
    } catch (error: any) {
      // Gracefully fall back to local booking data if network request fails
      return null;
    }
  }
);
