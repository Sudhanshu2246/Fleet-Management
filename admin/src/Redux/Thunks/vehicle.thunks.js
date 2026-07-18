import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

// ================= CREATE VEHICLE =================
export const createVehicle = createAsyncThunk(
  "vehicle/createVehicle",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await api.post("/vehicles/register-vehicle", formData);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to create vehicle" }
      );
    }
  }
);

// ================= GET ALL VEHICLES =================
export const getVehicles = createAsyncThunk(
  "vehicle/getVehicles",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/vehicles/all-vehicles");
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to fetch vehicles" }
      );
    }
  }
);

// ================= UPDATE VEHICLE =================
export const updateVehicle = createAsyncThunk(
  "vehicle/updateVehicle",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/vehicles/${id}`, formData);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to update vehicle" }
      );
    }
  }
);

// ================= DELETE VEHICLE =================
export const deleteVehicle = createAsyncThunk(
  "vehicle/deleteVehicle",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.delete(`/vehicles/${id}`);
      return { id, message: res.data.message };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to delete vehicle" }
      );
    }
  }
);

// ================= GET ASSIGNED VEHICLES =================
export const getAssignedVehicles = createAsyncThunk(
  "vehicle/getAssignedVehicles",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/vehicles/assignments");
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to fetch assigned vehicles" }
      );
    }
  }
);

// ================= ASSIGN VEHICLE =================
export const assignVehicle = createAsyncThunk(
  "vehicle/assignVehicle",
  async (assignmentData, { rejectWithValue }) => {
    try {
      const res = await api.post("/vehicles/assign", assignmentData);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to assign vehicle" }
      );
    }
  }
);
