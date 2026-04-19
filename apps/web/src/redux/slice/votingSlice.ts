/**
 * Voting slice — מחובר ל-/api/vote (backend מלא עם quorum/proxy/weighted).
 */
import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { getApiUrl, getApiHeaders } from '../../api';

export interface VoteOption {
  text: string;
  costEstimate?: number;
  optionIndex?: number;
  totalWeight?: number;
  voteCount?: number;
}

export interface Vote {
  _id: string;
  title: string;
  description?: string;
  options: VoteOption[];
  status: 'Open' | 'Closed' | 'Passed' | 'Rejected' | 'Expired';
  deadline: string;
  closedAt?: string;
  protocolSignature?: string;
  requiredQuorum?: number;
  eligibleVoterCount?: number;
  buildingId: string;
  createdAt: string;
}

export interface VoteResults {
  vote: Pick<Vote, '_id' | 'title' | 'status' | 'deadline' | 'closedAt' | 'protocolSignature'>;
  options: VoteOption[];
  totalVotes: number;
  eligibleVoterCount: number;
  participationPercent: number;
  quorumMet: boolean;
  requiredQuorum: number;
  winningOptionIndex: number | null;
}

interface VotingState {
  votes: Vote[];
  selectedResults: VoteResults | null;
  loading: boolean;
  error: string | null;
  castLoading: boolean;
}

const initialState: VotingState = {
  votes: [],
  selectedResults: null,
  loading: false,
  error: null,
  castLoading: false,
};

export const fetchVotes = createAsyncThunk<Vote[], string | undefined>(
  'voting/fetchVotes',
  async (status, { rejectWithValue }) => {
    try {
      const url = status ? getApiUrl(`vote?status=${status}`) : getApiUrl('vote');
      const res = await fetch(url, { headers: getApiHeaders() });
      if (!res.ok) throw new Error('שגיאה בטעינת ההצבעות');
      return (await res.json()) as Vote[];
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
  }
);

export const fetchVoteResults = createAsyncThunk<VoteResults, string>(
  'voting/fetchVoteResults',
  async (voteId, { rejectWithValue }) => {
    try {
      const res = await fetch(getApiUrl(`vote/${voteId}`), { headers: getApiHeaders() });
      if (!res.ok) throw new Error('ההצבעה לא נמצאה');
      return (await res.json()) as VoteResults;
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
  }
);

export const castVote = createAsyncThunk<Vote, { voteId: string; optionIndex: number; voteWeight?: number }>(
  'voting/castVote',
  async ({ voteId, optionIndex, voteWeight }, { rejectWithValue }) => {
    try {
      const res = await fetch(getApiUrl(`vote/${voteId}/vote`), {
        method: 'POST',
        headers: { ...getApiHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ optionIndex, voteWeight }),
      });
      if (!res.ok) {
        const err = (await res.json()) as { error?: string };
        throw new Error(err.error ?? 'שגיאה בהצבעה');
      }
      return (await res.json()) as Vote;
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
  }
);

export const closeVote = createAsyncThunk<Vote, string>(
  'voting/closeVote',
  async (voteId, { rejectWithValue }) => {
    try {
      const res = await fetch(getApiUrl(`vote/${voteId}/close`), {
        method: 'POST',
        headers: getApiHeaders(),
      });
      if (!res.ok) throw new Error('שגיאה בסגירת ההצבעה');
      return (await res.json()) as Vote;
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
  }
);

const votingSlice = createSlice({
  name: 'voting',
  initialState,
  reducers: {
    clearVoteResults: (state) => {
      state.selectedResults = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVotes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVotes.fulfilled, (state, action: PayloadAction<Vote[]>) => {
        state.loading = false;
        state.votes = action.payload;
      })
      .addCase(fetchVotes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchVoteResults.fulfilled, (state, action: PayloadAction<VoteResults>) => {
        state.selectedResults = action.payload;
      })
      .addCase(castVote.pending, (state) => {
        state.castLoading = true;
        state.error = null;
      })
      .addCase(castVote.fulfilled, (state) => {
        state.castLoading = false;
      })
      .addCase(castVote.rejected, (state, action) => {
        state.castLoading = false;
        state.error = action.payload as string;
      })
      .addCase(closeVote.fulfilled, (state, action: PayloadAction<Vote>) => {
        const idx = state.votes.findIndex((v) => v._id === action.payload._id);
        if (idx !== -1) state.votes[idx] = action.payload;
      });
  },
});

export const { clearVoteResults, clearError } = votingSlice.actions;
export default votingSlice.reducer;
