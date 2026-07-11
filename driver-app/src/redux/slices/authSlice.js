import { createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

const initialState = {
  user: null,
  token: null,
  vehicle: null,
  isAuthenticated: false,
  loading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token, vehicle } = action.payload;
      state.user = user;
      state.token = token;
      state.vehicle = vehicle;
      state.isAuthenticated = true;
      
      AsyncStorage.setItem('token', token);
      AsyncStorage.setItem('user', JSON.stringify(user));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.vehicle = null;
      state.isAuthenticated = false;
      AsyncStorage.removeItem('token');
      AsyncStorage.removeItem('user');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
