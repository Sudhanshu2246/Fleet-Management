import { createSlice } from '@reduxjs/toolkit';
import { fetchVehicleDocumentsThunk } from '../thunks/documentsThunks';

interface DocumentsState {
  data: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: DocumentsState = {
  data: null,
  loading: false,
  error: null,
};

const documentsSlice = createSlice({
  name: 'documents',
  initialState,
  reducers: {
    clearDocuments: (state) => {
      state.data = null;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVehicleDocumentsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVehicleDocumentsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
      })
      .addCase(fetchVehicleDocumentsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearDocuments } = documentsSlice.actions;
export default documentsSlice.reducer;
