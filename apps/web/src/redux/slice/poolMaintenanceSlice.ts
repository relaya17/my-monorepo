// src/store/poolMaintenanceSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface PoolMaintenanceState {
  maintenance: {
    id: number;
    date: string;
    maintenanceTask: string;
    employeeName: string;
    paymentAmount: string;
  }[];
}

const initialState: PoolMaintenanceState = {
  maintenance: [],
};

const poolMaintenanceSlice = createSlice({
  name: 'poolMaintenance',
  initialState,
  reducers: {
    addMaintenance: (state, action: PayloadAction<{ date: string; maintenanceTask: string; employeeName: string; paymentAmount: string }>) => {
      const newMaintenance = { id: Date.now(), ...action.payload };
      state.maintenance.push(newMaintenance);
    },
  },
});

export const { addMaintenance } = poolMaintenanceSlice.actions;
export default poolMaintenanceSlice.reducer;
