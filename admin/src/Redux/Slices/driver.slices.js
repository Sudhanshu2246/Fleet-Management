import { createSlice } from "@reduxjs/toolkit";
import {
  createDriver,
  getDrivers,
  assignVehicle,
  updateDriverStatus,
  updateDriver,
  deleteDriver,
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

      // ================= UPDATE DRIVER =================
      .addCase(updateDriver.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateDriver.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const index = state.drivers.findIndex((d) => d.id === action.payload.data.id || d._id === action.payload.data.id);
        if (index !== -1) {
          state.drivers[index] = action.payload.data;
        }
      })
      .addCase(updateDriver.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to update driver";
      })

      // ================= UPDATE STATUS =================
      .addCase(updateDriverStatus.fulfilled, (state, action) => {
        const index = state.drivers.findIndex(
          (d) => d.id === action.payload.data.userId || d._id === action.payload.data.userId
        );
        if (index !== -1) {
          state.drivers[index].Driver = action.payload.data;
          state.success = true;
        }
      })

      // ================= ASSIGN VEHICLE =================
      .addCase(assignVehicle.fulfilled, (state, action) => {
        // Since assignVehicle updates both driver and vehicle, 
        // we update the driver in our local state
        const index = state.drivers.findIndex(
          (d) => d.id === action.payload.data.driver.id || d._id === action.payload.data.driver.id
        );
        if (index !== -1) {
          state.drivers[index] = action.payload.data.driver;
        }
      })
      
      // ================= DELETE DRIVER =================
      .addCase(deleteDriver.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteDriver.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.drivers = state.drivers.filter(d => d.id !== action.payload.id && d._id !== action.payload.id);
      })
      .addCase(deleteDriver.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to delete driver";
      });
  },
});

export const { clearDriverState } = driverSlice.actions;
export default driverSlice.reducer;
