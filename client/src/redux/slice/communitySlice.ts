import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface Post {
    id: string;
    author: string;
    authorId: string;
    content: string;
    image?: string;
    timestamp: Date;
    status: 'pending' | 'approved' | 'rejected';
    likes: number;
    likedBy: string[];
    comments: Comment[];
    category?: 'general' | 'announcement' | 'event' | 'complaint' | 'suggestion';
}

export interface Comment {
    id: string;
    author: string;
    authorId: string;
    content: string;
    timestamp: Date;
    likes: number;
    likedBy: string[];
}

export interface CreatePostData {
    content: string;
    image?: File;
    category?: string;
}

export interface CommunityState {
    posts: Post[];
    loading: boolean;
    error: string | null;
    filter: 'all' | 'pending' | 'approved' | 'rejected';
    currentUser: {
        id: string;
        name: string;
        isAdmin: boolean;
    } | null;
}

const initialState: CommunityState = {
    posts: [],
    loading: false,
    error: null,
    filter: 'all',
    currentUser: null
};

// Async thunks
export const fetchPosts = createAsyncThunk(
    'community/fetchPosts',
    async (_, { rejectWithValue }) => {
        try {
            // כאן יהיה קריאה לשרת
            const response = await fetch('/api/posts');
            if (!response.ok) {
                throw new Error('Failed to fetch posts');
            }
            const data = await response.json();
            return data;
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
        }
    }
);

export const createPost = createAsyncThunk(
    'community/createPost',
    async (postData: CreatePostData, { rejectWithValue }) => {
        try {
            const formData = new FormData();
            formData.append('content', postData.content);
            if (postData.image) {
                formData.append('image', postData.image);
            }
            if (postData.category) {
                formData.append('category', postData.category);
            }

            const response = await fetch('/api/posts', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Failed to create post');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
        }
    }
);

export const approvePost = createAsyncThunk(
    'community/approvePost',
    async (postId: string, { rejectWithValue }) => {
        try {
            const response = await fetch(`/api/posts/${postId}/approve`, {
                method: 'PUT'
            });

            if (!response.ok) {
                throw new Error('Failed to approve post');
            }

            return postId;
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
        }
    }
);

export const rejectPost = createAsyncThunk(
    'community/rejectPost',
    async (postId: string, { rejectWithValue }) => {
        try {
            const response = await fetch(`/api/posts/${postId}/reject`, {
                method: 'PUT'
            });

            if (!response.ok) {
                throw new Error('Failed to reject post');
            }

            return postId;
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
        }
    }
);

export const likePost = createAsyncThunk(
    'community/likePost',
    async (postId: string, { rejectWithValue, getState }) => {
        try {
            const state = getState() as { community: CommunityState };
            const currentUser = state.community.currentUser;

            if (!currentUser) {
                throw new Error('User not authenticated');
            }

            const response = await fetch(`/api/posts/${postId}/like`, {
                method: 'POST'
            });

            if (!response.ok) {
                throw new Error('Failed to like post');
            }

            return { postId, userId: currentUser.id };
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
        }
    }
);

export const addComment = createAsyncThunk(
    'community/addComment',
    async ({ postId, content }: { postId: string; content: string }, { rejectWithValue, getState }) => {
        try {
            const state = getState() as { community: CommunityState };
            const currentUser = state.community.currentUser;

            if (!currentUser) {
                throw new Error('User not authenticated');
            }

            const response = await fetch(`/api/posts/${postId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content })
            });

            if (!response.ok) {
                throw new Error('Failed to add comment');
            }

            const data = await response.json();
            return { postId, comment: data };
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
        }
    }
);

const communitySlice = createSlice({
    name: 'community',
    initialState,
    reducers: {
        setFilter: (state, action: PayloadAction<'all' | 'pending' | 'approved' | 'rejected'>) => {
            state.filter = action.payload;
        },
        setCurrentUser: (state, action: PayloadAction<{ id: string; name: string; isAdmin: boolean }>) => {
            state.currentUser = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
        // Local actions for demo purposes
        addLocalPost: (state, action: PayloadAction<Post>) => {
            state.posts.unshift(action.payload);
        },
        updateLocalPostStatus: (state, action: PayloadAction<{ postId: string; status: 'approved' | 'rejected' }>) => {
            const post = state.posts.find(p => p.id === action.payload.postId);
            if (post) {
                post.status = action.payload.status;
            }
        },
        toggleLocalLike: (state, action: PayloadAction<{ postId: string; userId: string }>) => {
            const post = state.posts.find(p => p.id === action.payload.postId);
            if (post) {
                const userIndex = post.likedBy.indexOf(action.payload.userId);
                if (userIndex > -1) {
                    post.likedBy.splice(userIndex, 1);
                    post.likes--;
                } else {
                    post.likedBy.push(action.payload.userId);
                    post.likes++;
                }
            }
        },
        addLocalComment: (state, action: PayloadAction<{ postId: string; comment: Comment }>) => {
            const post = state.posts.find(p => p.id === action.payload.postId);
            if (post) {
                post.comments.push(action.payload.comment);
            }
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch posts
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
                state.error = action.payload as string;
            })
            // Create post
            .addCase(createPost.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createPost.fulfilled, (state, action) => {
                state.loading = false;
                state.posts.unshift(action.payload);
            })
            .addCase(createPost.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Approve post
            .addCase(approvePost.fulfilled, (state, action) => {
                const post = state.posts.find(p => p.id === action.payload);
                if (post) {
                    post.status = 'approved';
                }
            })
            // Reject post
            .addCase(rejectPost.fulfilled, (state, action) => {
                const post = state.posts.find(p => p.id === action.payload);
                if (post) {
                    post.status = 'rejected';
                }
            })
            // Like post
            .addCase(likePost.fulfilled, (state, action) => {
                const post = state.posts.find(p => p.id === action.payload.postId);
                if (post) {
                    const userIndex = post.likedBy.indexOf(action.payload.userId);
                    if (userIndex > -1) {
                        post.likedBy.splice(userIndex, 1);
                        post.likes--;
                    } else {
                        post.likedBy.push(action.payload.userId);
                        post.likes++;
                    }
                }
            })
            // Add comment
            .addCase(addComment.fulfilled, (state, action) => {
                const post = state.posts.find(p => p.id === action.payload.postId);
                if (post) {
                    post.comments.push(action.payload.comment);
                }
            });
    }
});

export const {
    setFilter,
    setCurrentUser,
    clearError,
    addLocalPost,
    updateLocalPostStatus,
    toggleLocalLike,
    addLocalComment
} = communitySlice.actions;

export default communitySlice.reducer; 