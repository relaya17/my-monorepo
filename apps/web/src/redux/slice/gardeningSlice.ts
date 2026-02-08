// src/store/gardeningSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface GardeningState {
  tasks: {
    id: number;
    date: string;
    wateringAmount: string;
    soilCheck: string;
    task: string;
  }[];
}

const initialState: GardeningState = {
  tasks: [],
};

const gardeningSlice = createSlice({
  name: 'gardening',
  initialState,
  reducers: {
    addTask: (state, action: PayloadAction<{ date: string; wateringAmount: string; soilCheck: string; task: string }>) => {
      const newTask = { id: Date.now(), ...action.payload };
      state.tasks.push(newTask);
    },
  },
});

export const { addTask } = gardeningSlice.actions;
export default gardeningSlice.reducer;
