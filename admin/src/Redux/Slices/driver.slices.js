import { createSlice } from "@reduxjs/toolkit";
import {
  createDriver,
  getDrivers,
  assignVehicle,
  updateDriverStatus,
} from "../Thunks/driver.thunks";

const initialState = {
  drivers: [],
  loading: false,
  error: null,
  success: false,
};

const driverSlice = createSlice({
  name: "driver",
  initialState,
  reducers: {
    clearDriverState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // ================= CREATE =================
      .addCase(createDriver.pending, (state) => {
        state.loading = true;
      })
      .addCase(createDriver.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.drivers.unshift(action.payload.data);
      })
      .addCase(createDriver.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to create driver";
      })

      // ================= GET ALL =================
      .addCase(getDrivers.pending, (state) => {
        state.loading = true;
      })
      .addCase(getDrivers.fulfilled, (state, action) => {
        state.loading = false;
        state.drivers = action.payload.data;
      })

      // ================= UPDATE STATUS =================
      .addCase(updateDriverStatus.fulfilled, (state, action) => {
        const index = state.drivers.findIndex(
          (d) => d._id === action.payload.data._id
        );
        if (index !== -1) {
          state.drivers[index] = action.payload.data;
        }
      })

      // ================= ASSIGN VEHICLE =================
      .addCase(assignVehicle.fulfilled, (state, action) => {
        // Since assignVehicle updates both driver and vehicle, 
        // we update the driver in our local state
        const index = state.drivers.findIndex(
          (d) => d._id === action.payload.data.driver._id
        );
        if (index !== -1) {
          state.drivers[index] = action.payload.data.driver;
        }
      });
  },
});

export const { clearDriverState } = driverSlice.actions;
export default driverSlice.reducer;
