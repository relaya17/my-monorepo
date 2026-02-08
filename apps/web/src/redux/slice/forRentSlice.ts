// src/store/forRentSlice.ts
import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";

// הגדרת מבנה הדירה להשכרה
interface Apartment {
  id: number;
  address: string;
  price: number;
  description: string;
  image: string;
}

// הגדרת ה-state של דירות להשכרה
interface ForRentState {
  apartments: Apartment[];
  loading: boolean;
  error: string | null;
}

const initialState: ForRentState = {
  apartments: [
    {
      id: 1,
      address: "רחוב דוגמה 1, תל אביב",
      price: 5000,
      description: "דירה 2 חדרים, קרובה לחוף הים",
      image: "apartment.png", // תיקון שם הקובץ
    },
    {
      id: 2,
      address: "רחוב דוגמה 2, ירושלים",
      price: 7000,
      description: "דירה 3 חדרים, מרכז העיר",
      image: "apartment.png", // תיקון שם הקובץ
    },
  ],
  loading: false,
  error: null,
};

// Async thunk for fetching apartments for rent
export const fetchRentApartments = createAsyncThunk(
  'forRent/fetchRentApartments',
  async () => {
    const baseUrl = import.meta.env.VITE_API_URL;
    const response = await fetch(`${baseUrl}/apartments/for-rent`);

    const url = `${baseUrl}/apartments/for-rent`
    console.log('[For rent request]', "sending", url)

    if (!response.ok) {
      throw new Error('Failed to fetch apartments for rent');
    }
    const data = await response.json();
    console.log('FOR RENT DATA', data)
    return data;
  }
);

// Async thunk for adding an apartment for rent
export const addRentApartmentAsync = createAsyncThunk(
  'forRent/addRentApartmentAsync',
  async (apartment: Omit<Apartment, 'id'>) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/apartments/for-rent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apartment),
    });
    if (!response.ok) {
      throw new Error('Failed to add apartment for rent');
    }
    return response.json();
  }
);

const forRentSlice = createSlice({
  name: "forRent",
  initialState,
  reducers: {
    addApartment: (state, action: PayloadAction<Apartment>) => {
      state.apartments.push(action.payload);
    },
    removeApartment: (state, action: PayloadAction<number>) => {
      state.apartments = state.apartments.filter(
        (apartment) => apartment.id !== action.payload
      );
    },
    clearError: (state) => {
      state.error = null;
    },
    resetState: (state) => {
      state.loading = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRentApartments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRentApartments.fulfilled, (state, action) => {
        state.loading = false;
        state.apartments = action.payload;
      })
      .addCase(fetchRentApartments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch apartments for rent';
      })
      .addCase(addRentApartmentAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addRentApartmentAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.apartments.push(action.payload);
      })
      .addCase(addRentApartmentAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to add apartment for rent';
      });
  },
});

export const {
  addApartment,
  removeApartment,
  clearError,
  resetState
} = forRentSlice.actions;

export default forRentSlice.reducer;
