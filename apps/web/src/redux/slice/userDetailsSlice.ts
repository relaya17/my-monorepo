import { createSlice, type PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

interface User {
  id: number;
  name: string;
  email: string;
}

interface UserDetailsState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserDetailsState = {
  user: null,
  loading: false,
  error: null,
};

export const fetchUserDetails = createAsyncThunk(
  "userDetails/fetchUserDetails",
  async (userId: number) => {
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/${userId}`);
    return response.data;
  }
);

const userDetailsSlice = createSlice({
  name: "userDetails",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserDetails.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchUserDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "שגיאה בהבאת פרטי המשתמש";
      });
  },
});

export default userDetailsSlice.reducer;
