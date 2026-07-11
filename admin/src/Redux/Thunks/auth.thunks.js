import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

// ================= REGISTER COMPANY =================
export const registerCompany = createAsyncThunk(
  "auth/registerCompany",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await api.post("/auth/register-company", formData, {
        headers: {
          "Content-Type": "multipart/form-data", // for GST file upload
        },
      });
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Registration failed" }
      );
    }
  }
);

// ================= LOGIN =================
export const login = createAsyncThunk(
  "auth/login",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await api.post("/auth/login", payload);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Login failed" }
      );
    }
  }
);

// ================= LOGOUT =================
export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.post("/auth/logout");
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Logout failed" }
      );
    }
  }
);