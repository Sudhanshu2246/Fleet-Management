import { createSlice } from "@reduxjs/toolkit";
import { registerCompany, login, logout } from "../Thunks/auth.thunks";

const initialState = {
  user: null,
  token: localStorage.getItem("token") || null,
  organization: null,

  loading: false,
  error: null,
  success: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder

      // ================= REGISTER =================
      .addCase(registerCompany.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerCompany.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;

        state.user = action.payload.user;
        state.organization = action.payload.organization;
        state.token = action.payload.token;

        localStorage.setItem("token", action.payload.token);
      })
      .addCase(registerCompany.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Registration failed";
      })

      // ================= LOGIN =================
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;

        state.user = action.payload.user;
        state.token = action.payload.token;

        localStorage.setItem("token", action.payload.token);
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Login failed";
      })

      // ================= LOGOUT =================
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;

        state.user = null;
        state.token = null;
        state.organization = null;

        localStorage.removeItem("token");
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Logout failed";
      });
  },
});

export const { clearAuthState } = authSlice.actions;

export default authSlice.reducer;