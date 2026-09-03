import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchDriverProfileThunk, updateDriverProfileThunk } from '../thunks/profileThunks';

interface ProfileState {
  data: any | null;
  loading: boolean;
  updating: boolean;
  error: string | null;
}

const initialState: ProfileState = {
  data: null,
  loading: false,
  updating: false,
  error: null,
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearProfileState: (state) => {
      state.data = null;
      state.loading = false;
      state.updating = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDriverProfileThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDriverProfileThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(fetchDriverProfileThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateDriverProfileThunk.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateDriverProfileThunk.fulfilled, (state, action) => {
        state.updating = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(updateDriverProfileThunk.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload as string;
      });
  }
});

export const { clearProfileState } = profileSlice.actions;
export default profileSlice.reducer;
