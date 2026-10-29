import { createSlice } from "@reduxjs/toolkit";
import {
  getTrackingStats,
  getLoggedInDriversTelemetry,
  getDriverLiveTelemetry,
  getActiveFleetStops,
  getTripStops,
  getTripLiveStatus,
  getTripHistory,
} from "../Thunks/tracking.thunks";

const initialState = {
  stats: {
    activeUnits: 0,
    idleUnits: 0,
    stoppedUnits: 0,
    offlineUnits: 0,
    totalDrivers: 0,
    redis: { connected: false, pingMs: 0 },
  },
  statsLoading: false,

  loggedInDrivers: [],
  loggedInDriversLoading: false,

  activeStops: [],
  activeStopsLoading: false,

  driverLive: null,
  driverLiveLoading: false,

  tripHistory: {
    count: 0,
    rows: [],
  },
  tripHistoryLoading: false,

  tripStops: [],
  tripStopsLoading: false,

  tripLiveStatus: null,
  tripLiveStatusLoading: false,

  error: null,
};

const trackingSlice = createSlice({
  name: "tracking",
  initialState,
  reducers: {
    clearTrackingError: (state) => {
      state.error = null;
    },
    updateDriverLocationLocally: (state, action) => {
      const update = action.payload;
      if (!update || !update.driverId) return;

      const idx = state.loggedInDrivers.findIndex(
        (d) => Number(d.driverId) === Number(update.driverId)
      );
      if (idx !== -1) {
        state.loggedInDrivers[idx] = {
          ...state.loggedInDrivers[idx],
          ...update,
        };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // ================= GET TRACKING STATS =================
      .addCase(getTrackingStats.pending, (state) => {
        state.statsLoading = true;
      })
      .addCase(getTrackingStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        if (action.payload?.data) {
          state.stats = action.payload.data;
        }
      })
      .addCase(getTrackingStats.rejected, (state, action) => {
        state.statsLoading = false;
        state.error = action.payload?.message || "Failed to load stats";
      })

      // ================= GET LOGGED IN DRIVERS TELEMETRY =================
      .addCase(getLoggedInDriversTelemetry.pending, (state) => {
        state.loggedInDriversLoading = true;
      })
      .addCase(getLoggedInDriversTelemetry.fulfilled, (state, action) => {
        state.loggedInDriversLoading = false;
        state.loggedInDrivers = Array.isArray(action.payload?.data)
          ? action.payload.data
          : [];
      })
      .addCase(getLoggedInDriversTelemetry.rejected, (state, action) => {
        state.loggedInDriversLoading = false;
        state.error = action.payload?.message || "Failed to load driver telemetry";
      })

      // ================= GET DRIVER LIVE TELEMETRY =================
      .addCase(getDriverLiveTelemetry.pending, (state) => {
        state.driverLiveLoading = true;
      })
      .addCase(getDriverLiveTelemetry.fulfilled, (state, action) => {
        state.driverLiveLoading = false;
        state.driverLive = action.payload?.data || null;
      })
      .addCase(getDriverLiveTelemetry.rejected, (state, action) => {
        state.driverLiveLoading = false;
        state.error = action.payload?.message || "Failed to load driver live data";
      })

      // ================= GET ACTIVE FLEET STOPS =================
      .addCase(getActiveFleetStops.pending, (state) => {
        state.activeStopsLoading = true;
      })
      .addCase(getActiveFleetStops.fulfilled, (state, action) => {
        state.activeStopsLoading = false;
        state.activeStops = Array.isArray(action.payload?.data)
          ? action.payload.data
          : [];
      })
      .addCase(getActiveFleetStops.rejected, (state, action) => {
        state.activeStopsLoading = false;
        state.error = action.payload?.message || "Failed to load active stops";
      })

      // ================= GET TRIP STOPS =================
      .addCase(getTripStops.pending, (state) => {
        state.tripStopsLoading = true;
      })
      .addCase(getTripStops.fulfilled, (state, action) => {
        state.tripStopsLoading = false;
        state.tripStops = Array.isArray(action.payload?.data)
          ? action.payload.data
          : [];
      })
      .addCase(getTripStops.rejected, (state, action) => {
        state.tripStopsLoading = false;
        state.error = action.payload?.message || "Failed to load trip stops";
      })

      // ================= GET TRIP LIVE STATUS =================
      .addCase(getTripLiveStatus.pending, (state) => {
        state.tripLiveStatusLoading = true;
      })
      .addCase(getTripLiveStatus.fulfilled, (state, action) => {
        state.tripLiveStatusLoading = false;
        state.tripLiveStatus = action.payload?.data || null;
      })
      .addCase(getTripLiveStatus.rejected, (state, action) => {
        state.tripLiveStatusLoading = false;
        state.error = action.payload?.message || "Failed to load trip live status";
      })

      // ================= GET TRIP HISTORY =================
      .addCase(getTripHistory.pending, (state) => {
        state.tripHistoryLoading = true;
      })
      .addCase(getTripHistory.fulfilled, (state, action) => {
        state.tripHistoryLoading = false;
        if (action.payload?.data) {
          state.tripHistory = {
            count: action.payload.data.count || 0,
            rows: action.payload.data.rows || [],
          };
        }
      })
      .addCase(getTripHistory.rejected, (state, action) => {
        state.tripHistoryLoading = false;
        state.error = action.payload?.message || "Failed to load trip history";
      });
  },
});

export const { clearTrackingError, updateDriverLocationLocally } =
  trackingSlice.actions;
export default trackingSlice.reducer;
