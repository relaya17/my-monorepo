import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface SecondNavbarState {
  activeMenu: string | null;
}

const initialState: SecondNavbarState = {
  activeMenu: null,
};

const secondNavbarSlice = createSlice({
  name: 'secondNavbar',
  initialState,
  reducers: {
    setActiveMenu(state, action: PayloadAction<string | null>) {
      state.activeMenu = action.payload;
    },
  },
});

export const { setActiveMenu } = secondNavbarSlice.actions;
export default secondNavbarSlice.reducer;
