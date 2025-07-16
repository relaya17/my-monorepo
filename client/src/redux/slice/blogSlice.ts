import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';

// הממשקים
interface Post {
  id: string;
  content: string;
  author: string;
  comments: Comment[];
}

interface Comment {
  id: string;
  text: string;
  author: string;
}

interface BlogState {
  posts: Post[];
  loading: boolean;
  error: string | null;
}

// מצב התחלתי
const initialState: BlogState = {
  posts: [],
  loading: false,
  error: null,
};

// Async thunk for fetching posts
export const fetchPosts = createAsyncThunk(
  'blog/fetchPosts',
  async () => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/blog/posts`);
    if (!response.ok) {
      throw new Error('Failed to fetch posts');
    }
    return response.json();
  }
);

// Async thunk for adding a post
export const addPostAsync = createAsyncThunk(
  'blog/addPostAsync',
  async (post: { content: string; author: string }) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/blog/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(post),
    });
    if (!response.ok) {
      throw new Error('Failed to add post');
    }
    return response.json();
  }
);

// יצירת ה-slice
const blogSlice = createSlice({
  name: 'blog',
  initialState,
  reducers: {
    addPost: (state, action: PayloadAction<{ content: string; author: string }>) => {
      const newPost: Post = {
        id: Date.now().toString(),
        content: action.payload.content,
        author: action.payload.author,
        comments: [],
      };
      state.posts.push(newPost);
    },
    addComment: (state, action: PayloadAction<{ postId: string; text: string; author: string }>) => {
      const post = state.posts.find((p) => p.id === action.payload.postId);
      if (post) {
        const newComment: Comment = {
          id: Date.now().toString(),
          text: action.payload.text,
          author: action.payload.author,
        };
        post.comments.push(newComment);
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch posts';
      })
      .addCase(addPostAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addPostAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.posts.push(action.payload);
      })
      .addCase(addPostAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to add post';
      });
  },
});

export const { addPost, addComment, clearError } = blogSlice.actions;
export default blogSlice.reducer;
