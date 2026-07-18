import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

// ================= CREATE DRIVER =================
export const createDriver = createAsyncThunk(
  "driver/createDriver",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await api.post("/drivers", formData);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to create driver" }
      );
    }
  }
);

// ================= GET ALL DRIVERS =================
export const getDrivers = createAsyncThunk(
  "driver/getDrivers",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/drivers/all-drivers");
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to fetch drivers" }
      );
    }
  }
);

// ================= ASSIGN VEHICLE =================
export const assignVehicle = createAsyncThunk(
  "driver/assignVehicle",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await api.post("/drivers/assign-vehicle", payload);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to assign vehicle" }
      );
    }
  }
);

// ================= UPDATE STATUS =================
export const updateDriverStatus = createAsyncThunk(
  "driver/updateDriverStatus",
  async ({ id, isActive }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/drivers/${id}/status`, { isActive });
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to update driver status" }
      );
    }
  }
);

// ================= GET DRIVER BY ID =================
export const getDriverById = createAsyncThunk(
  "driver/getDriverById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/drivers/${id}`);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to fetch driver details" }
      );
    }
  }
);
