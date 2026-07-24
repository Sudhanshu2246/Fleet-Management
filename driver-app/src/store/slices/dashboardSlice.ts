import { createSlice } from '@reduxjs/toolkit';
import { fetchDashboardDataThunk } from '../thunks/dashboardThunks';

interface DashboardState {
  assignment: any | null;
  vehicle: any | null;
  trip: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  assignment: null,
  vehicle: null,
  trip: null,
  loading: false,
  error: null,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardDataThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardDataThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.assignment = action.payload.assignment;
        state.vehicle = action.payload.vehicle;
        state.trip = action.payload.trip;
      })
      .addCase(fetchDashboardDataThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default dashboardSlice.reducer;
