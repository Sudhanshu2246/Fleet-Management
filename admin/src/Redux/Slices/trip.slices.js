import { createSlice } from "@reduxjs/toolkit";
import { getAllTrips, createAdminTrip, updateTripStatus, deleteTrip, updateTripDetails, getTripById } from "../Thunks/trip.thunks";

const initialState = {
  trips: [],
  loading: false,
  error: null,
  singleTrip: null,
  singleTripLoading: false,
};

const tripSlice = createSlice({
  name: "trip",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // ================= GET ALL TRIPS =================
      .addCase(getAllTrips.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllTrips.fulfilled, (state, action) => {
        state.loading = false;
        // Deduplicate incoming trips by id just in case
        const incomingTrips = action.payload.trips || [];
        const uniqueTripsMap = new Map();
        incomingTrips.forEach(t => {
          uniqueTripsMap.set(t.id, t);
        });
        state.trips = Array.from(uniqueTripsMap.values());
      })
      .addCase(getAllTrips.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch trips";
      })

      // ================= GET TRIP BY ID =================
      .addCase(getTripById.pending, (state) => {
        state.singleTripLoading = true;
        state.error = null;
      })
      .addCase(getTripById.fulfilled, (state, action) => {
        state.singleTripLoading = false;
        state.singleTrip = action.payload.trip || null;
      })
      .addCase(getTripById.rejected, (state, action) => {
        state.singleTripLoading = false;
        state.error = action.payload?.message || "Failed to fetch trip details";
      })

      // ================= CREATE ADMIN TRIP =================
      .addCase(createAdminTrip.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAdminTrip.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.trip) {
          state.trips.unshift(action.payload.trip);
        }
      })
      .addCase(createAdminTrip.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to create trip";
      })

      // ================= UPDATE TRIP STATUS =================
      .addCase(updateTripStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateTripStatus.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.trip) {
          const index = state.trips.findIndex(t => t.id === action.payload.trip.id);
          if (index !== -1) {
            state.trips[index] = { ...state.trips[index], ...action.payload.trip };
          }
        }
      })
      .addCase(updateTripStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to update trip status";
      })

      // ================= UPDATE TRIP DETAILS =================
      .addCase(updateTripDetails.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateTripDetails.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.trip) {
          const updatedTrip = action.payload.trip;
          const index = state.trips.findIndex(t => t.id === updatedTrip.id || t._id === updatedTrip._id);
          if (index !== -1) {
            state.trips[index] = { ...state.trips[index], ...updatedTrip };
          } else {
            // Just in case it was created instead of updated, but we shouldn't push unless we want it in the list.
            // If it's missing, let's append it to be safe, but wait, the user says "do not create a new entry", so do nothing.
          }
        }
      })
      .addCase(updateTripDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to update trip details";
      })

      // ================= DELETE TRIP =================
      .addCase(deleteTrip.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteTrip.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.id) {
          state.trips = state.trips.filter(t => t.id !== action.payload.id);
        }
      })
      .addCase(deleteTrip.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to delete trip";
      });
  },
});

export default tripSlice.reducer;
