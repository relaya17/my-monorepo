// redux/slice/navbarSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface NavbarState {
  isOpen: boolean;
  activeMenu?: string; // אם תרצה להוסיף בעתיד מפתח עבור התפריט הפעיל
}

const initialState: NavbarState = {
  isOpen: false,
};

const navbarSlice = createSlice({
  name: 'navbar',
  initialState,
  reducers: {
    toggleNavbar: (state) => {
      state.isOpen = !state.isOpen;
    },
    closeNavbar: (state) => {
      state.isOpen = false;
    },
    // דוגמה למקרה שבו תוכל להוסיף פעולה נוספת בעתיד אם תצטרך לעדכן את ה-activeMenu
    setActiveMenu: (state, action: PayloadAction<string>) => {
      state.activeMenu = action.payload;
    },
  },
});

export const { toggleNavbar, closeNavbar, setActiveMenu } = navbarSlice.actions;
export default navbarSlice.reducer;

