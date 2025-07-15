// src/store/forSaleSlice.ts
import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";

// הגדרת מבנה הדירה
interface Apartment {
  id: number;
  address: string;
  price: number;
  description: string;
  image: string;
}

// הגדרת ה-state
interface ForSaleState {
  apartments: Apartment[];
  loading: boolean;
  error: string | null;
}

const initialState: ForSaleState = {
  apartments: [
    {
      id: 1,
      address: "רחוב דוגמה 1, תל אביב",
      price: 1500000,
      description: "דירה 3 חדרים, קרובה למרכז העיר",
      image: "aparment.png",
    },
    {
      id: 2,
      address: "רחוב דוגמה 2, ירושלים",
      price: 2000000,
      description: "דירה 4 חדרים, עם נוף לים",
      image: "aparment.png",
    },
    // הוספת דירות נוספות כאן...
  ],
  loading: false,
  error: null,
};

// Async thunk for fetching apartments
export const fetchApartments = createAsyncThunk(
  'forSale/fetchApartments',
  async () => {
    const response = await fetch('http://localhost:3008/api/apartments/for-sale');
    if (!response.ok) {
      throw new Error('Failed to fetch apartments');
    }
    return response.json();
  }
);

// Async thunk for adding an apartment
export const addApartmentAsync = createAsyncThunk(
  'forSale/addApartmentAsync',
  async (apartment: Omit<Apartment, 'id'>) => {
    const response = await fetch('http://localhost:3008/api/apartments/for-sale', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apartment),
    });
    if (!response.ok) {
      throw new Error('Failed to add apartment');
    }
    return response.json();
  }
);

const forSaleSlice = createSlice({
  name: "forSale",
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
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchApartments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchApartments.fulfilled, (state, action) => {
        state.loading = false;
        state.apartments = action.payload;
      })
      .addCase(fetchApartments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch apartments';
      })
      .addCase(addApartmentAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addApartmentAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.apartments.push(action.payload);
      })
      .addCase(addApartmentAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to add apartment';
      });
  },
});

export const { addApartment, removeApartment, clearError } = forSaleSlice.actions;
export default forSaleSlice.reducer;
