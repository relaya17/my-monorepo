// src/store/employeesSlice.ts
import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';

interface Employee {
  id: string;
  name: string;
  role: string;
  hoursWorked: number;  // הוספתי את השדה hoursWorked
}

interface EmployeesState {
  employees: Employee[];
  loading: boolean;
  error: string | null;
}

const initialState: EmployeesState = {
  employees: [],
  loading: false,
  error: null,
};

// Async thunk for fetching employees
export const fetchEmployees = createAsyncThunk(
  'employees/fetchEmployees',
  async () => {
    const response = await fetch('http://localhost:3008/api/employees');
    if (!response.ok) {
      throw new Error('Failed to fetch employees');
    }
    return response.json();
  }
);

// Async thunk for adding an employee
export const addEmployeeAsync = createAsyncThunk(
  'employees/addEmployeeAsync',
  async (employee: Omit<Employee, 'id'>) => {
    const response = await fetch('http://localhost:3008/api/employees', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(employee),
    });
    if (!response.ok) {
      throw new Error('Failed to add employee');
    }
    return response.json();
  }
);

const employeesSlice = createSlice({
  name: 'employees',
  initialState,
  reducers: {
    addEmployee: (state, action: PayloadAction<Employee>) => {
      state.employees.push(action.payload);
    },
    removeEmployee: (state, action: PayloadAction<string>) => {
      state.employees = state.employees.filter(employee => employee.id !== action.payload);
    },
    updateEmployeeHours: (state, action: PayloadAction<{ id: string, hours: number }>) => {
      const { id, hours } = action.payload;
      const employee = state.employees.find(employee => employee.id === id);
      if (employee) {
        employee.hoursWorked = hours;  // עדיין מעדכן ב-hoursWorked
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployees.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.loading = false;
        state.employees = action.payload;
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch employees';
      })
      .addCase(addEmployeeAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addEmployeeAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.employees.push(action.payload);
      })
      .addCase(addEmployeeAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to add employee';
      });
  },
});

export const { addEmployee, removeEmployee, updateEmployeeHours, clearError } = employeesSlice.actions;
export default employeesSlice.reducer;
