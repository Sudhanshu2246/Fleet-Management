import { createSlice } from "@reduxjs/toolkit";
import {
  createVehicle,
  getVehicles,
  updateVehicle,
  deleteVehicle,
} from "../Thunks/vehicle.thunks";

const initialState = {
  vehicles: [],
  loading: false,
  error: null,
  success: false,
};

const vehicleSlice = createSlice({
  name: "vehicle",
  initialState,
  reducers: {
    clearVehicleState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // ================= CREATE =================
      .addCase(createVehicle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createVehicle.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.vehicles.unshift(action.payload.data);
      })
      .addCase(createVehicle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to create vehicle";
      })

      // ================= GET ALL =================
      .addCase(getVehicles.pending, (state) => {
        state.loading = true;
      })
      .addCase(getVehicles.fulfilled, (state, action) => {
        state.loading = false;
        state.vehicles = action.payload.data;
      })
      .addCase(getVehicles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch vehicles";
      })

      // ================= UPDATE =================
      .addCase(updateVehicle.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.vehicles.findIndex(
          (v) => v._id === action.payload.data._id
        );
        if (index !== -1) {
          state.vehicles[index] = action.payload.data;
        }
      })

      // ================= DELETE =================
      .addCase(deleteVehicle.fulfilled, (state, action) => {
        state.loading = false;
        state.vehicles = state.vehicles.filter((v) => v._id !== action.payload.id);
      });
  },
});

export const { clearVehicleState } = vehicleSlice.actions;
export default vehicleSlice.reducer;
