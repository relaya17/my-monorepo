import { createSlice, type PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import type { User } from '../types/types';

export type SignUpState = {
  user: User | null;
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
};

const initialState: SignUpState = {
  user: null,
  status: 'idle',
  error: null,
};

export const signUpUser = createAsyncThunk(
  'signUp/signUpUser',
  async (formData: { name: string; email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await fetch('http://localhost:3008/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      if (!response.ok) {
        throw new Error('שגיאה בהירשמות');
      }
      const data = await response.json();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const signUpSlice = createSlice({
  name: 'signUp',
  initialState,
  reducers: {
    clearUser: (state) => {
      state.user = null;
      state.status = 'idle';
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(signUpUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(signUpUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.status = 'success';
        state.user = action.payload;
      })
      .addCase(signUpUser.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.payload as string;
      });
  }
});

export const { clearUser } = signUpSlice.actions;
export default signUpSlice.reducer;
