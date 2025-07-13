// src/store/filesSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface FileItem {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: string;
}

interface FilesState {
  files: FileItem[];
  loading: boolean;
  error: string | null;
}

const initialState: FilesState = {
  files: [],
  loading: false,
  error: null,
};

// Async thunk for fetching files
export const fetchFiles = createAsyncThunk(
  'files/fetchFiles',
  async () => {
    const response = await fetch('http://localhost:3008/api/files');
    if (!response.ok) {
      throw new Error('Failed to fetch files');
    }
    return response.json();
  }
);

// Async thunk for uploading a file
export const uploadFile = createAsyncThunk(
  'files/uploadFile',
  async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('http://localhost:3008/api/files/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload file');
    }
    return response.json();
  }
);

const filesSlice = createSlice({
  name: 'files',
  initialState,
  reducers: {
    addFile: (state, action: PayloadAction<FileItem>) => {
      state.files.push(action.payload);
    },
    removeFile: (state, action: PayloadAction<string>) => {
      state.files = state.files.filter(file => file.id !== action.payload);
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFiles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFiles.fulfilled, (state, action) => {
        state.loading = false;
        state.files = action.payload;
      })
      .addCase(fetchFiles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch files';
      })
      .addCase(uploadFile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadFile.fulfilled, (state, action) => {
        state.loading = false;
        state.files.push(action.payload);
      })
      .addCase(uploadFile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to upload file';
      });
  },
});

export const { addFile, removeFile, clearError } = filesSlice.actions;
export default filesSlice.reducer;
