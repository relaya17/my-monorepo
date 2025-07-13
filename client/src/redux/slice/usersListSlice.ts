import { createSlice, type PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

interface User {
  id: number;
  name: string;
  email: string;
}

interface UsersListState {
  users: User[];
  loading: boolean;
  error: string | null;
}

const initialState: UsersListState = {
  users: [],
  loading: false,
  error: null,
};

export const fetchUsers = createAsyncThunk("usersList/fetchUsers", async () => {
  const response = await axios.get("/api/users");
  return response.data;
});

const usersListSlice = createSlice({
  name: "usersList",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "שגיאה בהבאת הנתונים";
      });
  },
});

export default usersListSlice.reducer;
