import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface FileData {
  id: string;
  name: string;
  url: string;
}

interface NewResidentApprovalState {
  files: FileData[];
}

const initialState: NewResidentApprovalState = {
  files: [],
};

const newResidentApprovalSlice = createSlice({
  name: 'newResidentApproval',
  initialState,
  reducers: {
    addFile: (state, action: PayloadAction<FileData>) => {
      state.files.push(action.payload);
    },
    removeFile: (state, action: PayloadAction<string>) => {
      state.files = state.files.filter(file => file.id !== action.payload);
    },
  },
});

export const { addFile, removeFile } = newResidentApprovalSlice.actions;
export default newResidentApprovalSlice.reducer;
