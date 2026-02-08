// redux/slice/PaymentSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface PaymentState {
  payer: string;
  amount: number;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
}

const initialState: PaymentState = {
  payer: '',
  amount: 0,
  cardNumber: '',
  expiryDate: '',
  cvv: ''
};

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    setPaymentDetails: (state, action: PayloadAction<Partial<PaymentState>>) => {
      return { ...state, ...action.payload };
    },
    clearPaymentDetails: () => initialState
  }
});

export const { setPaymentDetails, clearPaymentDetails } = paymentSlice.actions;

export default paymentSlice.reducer;
