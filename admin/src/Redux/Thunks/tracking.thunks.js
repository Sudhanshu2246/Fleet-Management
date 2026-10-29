import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

// ================= GET TRACKING STATS =================
export const getTrackingStats = createAsyncThunk(
  "tracking/getTrackingStats",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/tracking/stats");
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to fetch tracking stats" }
      );
    }
  }
);

// ================= GET LOGGED IN DRIVERS TELEMETRY =================
export const getLoggedInDriversTelemetry = createAsyncThunk(
  "tracking/getLoggedInDriversTelemetry",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/tracking/drivers/logged-in");
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to fetch driver telemetry" }
      );
    }
  }
);

// ================= GET DRIVER LIVE TELEMETRY =================
export const getDriverLiveTelemetry = createAsyncThunk(
  "tracking/getDriverLiveTelemetry",
  async (driverId, { rejectWithValue }) => {
    try {
      const res = await api.get(`/tracking/drivers/${driverId}/live`);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to fetch driver live location" }
      );
    }
  }
);

// ================= GET ACTIVE FLEET STOPS =================
export const getActiveFleetStops = createAsyncThunk(
  "tracking/getActiveFleetStops",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/tracking/stops/active");
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to fetch active stops" }
      );
    }
  }
);

// ================= GET TRIP STOPS =================
export const getTripStops = createAsyncThunk(
  "tracking/getTripStops",
  async (tripId, { rejectWithValue }) => {
    try {
      const res = await api.get(`/tracking/trips/${tripId}/stops`);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to fetch trip stops" }
      );
    }
  }
);

// ================= GET TRIP LIVE STATUS =================
export const getTripLiveStatus = createAsyncThunk(
  "tracking/getTripLiveStatus",
  async (tripId, { rejectWithValue }) => {
    try {
      const res = await api.get(`/tracking/trips/${tripId}/live-status`);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to fetch trip live status" }
      );
    }
  }
);

// ================= GET TRIP HISTORY =================
export const getTripHistory = createAsyncThunk(
  "tracking/getTripHistory",
  async (params = {}, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams();
      if (params.page) query.append("page", params.page);
      if (params.limit) query.append("limit", params.limit);
      if (params.driverId) query.append("driverId", params.driverId);
      if (params.vehicleId) query.append("vehicleId", params.vehicleId);
      if (params.tripId) query.append("tripId", params.tripId);

      const qs = query.toString();
      const res = await api.get(`/tracking/trip-history${qs ? `?${qs}` : ""}`);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to fetch trip history" }
      );
    }
  }
);
