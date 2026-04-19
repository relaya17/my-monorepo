// src/store/repairTrackingSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface RepairTrackingState {
  repairs: {
    id: number;
    date: string;
    task: string;
    status: string;
  }[];
}

const initialState: RepairTrackingState = {
  repairs: [],
};

const repairTrackingSlice = createSlice({
  name: 'repairTracking',
  initialState,
  reducers: {
    addRepair: (state, action: PayloadAction<{ date: string; task: string; status: string }>) => {
      const newRepair = { id: Date.now(), ...action.payload };
      state.repairs.push(newRepair);
    },
  },
});

export const { addRepair } = repairTrackingSlice.actions;
export default repairTrackingSlice.reducer;
