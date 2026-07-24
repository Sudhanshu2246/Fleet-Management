import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { driverLoginThunk } from '../thunks/authThunks';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  user: any | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    restoreSession: (state, action: PayloadAction<{ token: string; user: any }>) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.error = null;
      AsyncStorage.removeItem('authToken');
      AsyncStorage.removeItem('authUser');
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(driverLoginThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(driverLoginThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(driverLoginThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, restoreSession } = authSlice.actions;
export default authSlice.reducer;
