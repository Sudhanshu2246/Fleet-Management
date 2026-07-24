import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

// ================= GET ALL TRIPS =================
export const getAllTrips = createAsyncThunk(
  "trip/getAllTrips",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/trips/all?limit=50");
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Something went wrong" },
      );
    }
  },
);

// ================= GET TRIP BY ID =================
export const getTripById = createAsyncThunk(
  "trip/getTripById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/trips/${id}`);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to fetch trip details" },
      );
    }
  },
);


export const updateTripStatus = createAsyncThunk(
  "trip/updateTripStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/trips/${id}/status`, { status });
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to update trip status" },
      );
    }
  },
);

export const deleteTrip = createAsyncThunk(
  "trip/deleteTrip",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.delete(`/trips/${id}`);
      return { id, ...res.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to delete trip" },
      );
    }
  },
);


// ================= CREATE ADMIN TRIP =================
export const createAdminTrip = createAsyncThunk(
  "trip/createAdminTrip",
  async (tripData, { rejectWithValue }) => {
    try {
      const res = await api.post("/trips/admin-create", tripData);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to create trip booking" }
      );
    }
  }
);

// ================= UPDATE TRIP DETAILS =================
export const updateTripDetails = createAsyncThunk(
  "trip/updateTripDetails",
  async ({ id, details }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/trips/${id}/details`, details);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to update trip details" }
      );
    }
  }
);
