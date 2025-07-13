import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// טיפוס של אפשרויות
interface Option {
  text: string;
  isCorrect: boolean;
}

// טיפוס של שאלה
interface Question {
  _id: string;
  question: string;
  options: Option[];
  correctAnswer: string; // אם השאלה כוללת שדה כזה
}

interface VotingState {
  questions: Question[];
}

const initialState: VotingState = {
  questions: [],
};

// קריאה כדי למשוך את השאלות
export const fetchQuestions = createAsyncThunk<Question[]>(
  'questions/fetchQuestions',
  async () => {
    const response = await fetch('https://example.com/api/questions');
    const data: Question[] = await response.json();
    return data;
  }
);

// שליחת הצבעה
export const vote = createAsyncThunk(
  'voting/vote',
  async ({ questionId, optionIndex }: { questionId: string; optionIndex: number }) => {
    await axios.post('http://localhost:3008/api/vote', { questionId, optionIndex });
  }
);

const votingSlice = createSlice({
  name: 'voting',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchQuestions.fulfilled, (state, action) => {
      state.questions = action.payload;
    });
  },
});

export default votingSlice.reducer;
