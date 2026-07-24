import { createSlice } from "@reduxjs/toolkit";
import {
  createVehicle,
  getVehicles,
  updateVehicle,
  deleteVehicle,
  getAssignedVehicles,
  assignVehicle,
  deleteAssignment,
  updateAssignment
} from "../Thunks/vehicle.thunks";

const initialState = {
  vehicles: [],
  assignments: [],
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

      // ================= GET ASSIGNED VEHICLES =================
      .addCase(getAssignedVehicles.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAssignedVehicles.fulfilled, (state, action) => {
        state.loading = false;
        state.assignments = action.payload.data;
      })
      .addCase(getAssignedVehicles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch assigned vehicles";
      })

      // ================= ASSIGN VEHICLE =================
      .addCase(assignVehicle.pending, (state) => {
        state.loading = true;
      })
      .addCase(assignVehicle.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        // Optionally prepend to assignments
        if (action.payload?.data) {
          state.assignments.unshift(action.payload.data);
        }
      })
      .addCase(assignVehicle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to assign vehicle";
      })

      // ================= UPDATE =================
      .addCase(updateVehicle.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateVehicle.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const index = state.vehicles.findIndex(
          (v) => v.id === action.payload.data.id || v._id === action.payload.data._id
        );
        if (index !== -1) {
          state.vehicles[index] = action.payload.data;
        }
      })
      .addCase(updateVehicle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to update vehicle";
      })

      // ================= DELETE =================
      .addCase(deleteVehicle.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteVehicle.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.vehicles = state.vehicles.filter((v) => v.id !== action.payload.id && v._id !== action.payload.id);
      })
      .addCase(deleteVehicle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to delete vehicle";
      })

      // ================= DELETE ASSIGNMENT =================
      .addCase(deleteAssignment.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteAssignment.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.assignments = state.assignments.filter((a) => a.id !== action.payload.id);
      })
      .addCase(deleteAssignment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to delete assignment";
      })

      // ================= UPDATE ASSIGNMENT =================
      .addCase(updateAssignment.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateAssignment.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const index = state.assignments.findIndex(a => a.id === action.payload.data?.id);
        if (index !== -1) {
          state.assignments[index] = action.payload.data;
        }
      })
      .addCase(updateAssignment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to update assignment";
      });
  },
});

export const { clearVehicleState } = vehicleSlice.actions;
export default vehicleSlice.reducer;
