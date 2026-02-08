// reducers/receiptReducer.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

// סוגי המידע שתרצה לשמור
interface ReceiptState {
  payer: string;
  amount: number;
  chairmanName: string;
}

const initialState: ReceiptState = {
  payer: '',
  amount: 0,
  chairmanName: '',
};

const receiptSlice = createSlice({
  name: 'receipt',
  initialState,
  reducers: {
    setReceipt: (state, action: PayloadAction<ReceiptState>) => {
      state.payer = action.payload.payer;
      state.amount = action.payload.amount;
      state.chairmanName = action.payload.chairmanName;
    },
  },
});

export const { setReceipt } = receiptSlice.actions;
export default receiptSlice.reducer;
