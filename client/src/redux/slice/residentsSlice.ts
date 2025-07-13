import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

// הגדרת טיפוס דייר
interface Resident {
  id: number;
  name: string;
  age: number;
  familyStatus: string;
  apartment: string;
}

// הגדרת המידע שנשמור ב-state
interface ResidentsState {
  residents: Resident[];
}

const initialState: ResidentsState = {
  residents: [], // כאן נשמור את הדיירים
};

// יצירת ה-Slice של הדיירים
const residentsSlice = createSlice({
  name: 'residents',
  initialState,
  reducers: {
    // פעולה להוסיף דייר חדש
    addResident: (state, action: PayloadAction<Resident>) => {
      state.residents.push(action.payload);
    },
    // פעולה לעדכן דייר
    updateResident: (state, action: PayloadAction<Resident>) => {
      const index = state.residents.findIndex(
        (resident) => resident.id === action.payload.id
      );
      if (index !== -1) {
        state.residents[index] = action.payload;
      }
    },
    // פעולה למחוק דייר
    removeResident: (state, action: PayloadAction<number>) => {
      state.residents = state.residents.filter(
        (resident) => resident.id !== action.payload
      );
    },
  },
});

export const { addResident, updateResident, removeResident } = residentsSlice.actions;

export default residentsSlice.reducer;
