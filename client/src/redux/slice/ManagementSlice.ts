// src/redux/slices/ManagementSlice.ts

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface Resident {
  id: string;
  name: string;
  apartment: string;
  status: string;
}

interface ManagementState {
  residents: Resident[];
  loading: boolean;
  error: string | null;
}

const initialState: ManagementState = {
  residents: [],
  loading: false,
  error: null,
};

const managementSlice = createSlice({
  name: 'management',
  initialState,
  reducers: {
    fetchResidentsRequest: (state) => {
      state.loading = true;
    },
    fetchResidentsSuccess: (state, action: PayloadAction<Resident[]>) => {
      state.loading = false;
      state.residents = action.payload;
    },
    fetchResidentsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { fetchResidentsRequest, fetchResidentsSuccess, fetchResidentsFailure } = managementSlice.actions;

export default managementSlice.reducer;
