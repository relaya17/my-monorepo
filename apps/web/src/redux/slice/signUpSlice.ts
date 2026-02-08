import { createSlice, type PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import type { User } from '../types/types';
import { apiRequestJson } from '../../api';

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
  async (formData: { name: string; email: string; password: string; buildingAddress?: string; buildingNumber?: string; apartmentNumber?: string; committeeName?: string }, { rejectWithValue }) => {
    try {
      const { response, data } = await apiRequestJson<{ message?: string; user?: User; field?: string }>('signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          buildingAddress: formData.buildingAddress,
          buildingNumber: formData.buildingNumber,
          apartmentNumber: formData.apartmentNumber,
          committeeName: formData.committeeName
        })
      });
      if (!response.ok) {
        return rejectWithValue(data?.message || 'שגיאה בהירשמות');
      }
      if (!data?.user) {
        return rejectWithValue('תגובה לא צפויה מהשרת');
      }
      return data.user;
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'שגיאה בהירשמות');
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
