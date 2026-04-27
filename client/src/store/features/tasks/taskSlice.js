import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import recommendationAPI from '../recommendation/recommendationAPI';

const initialState = {
  tasks: [],
  currentTask: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchRecommendations = createAsyncThunk(
  'tasks/fetchRecommendations',
  async ({ studentId, filters }, { rejectWithValue }) => {
    try {
      const response = await recommendationAPI.getStudentRecommendations(studentId, filters);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch recommendations');
    }
  }
);

export const generateRecommendations = createAsyncThunk(
  'tasks/generate',
  async (studentId, { rejectWithValue }) => {
    try {
      const response = await recommendationAPI.generateRecommendations(studentId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to generate recommendations');
    }
  }
);

export const updateTaskStatus = createAsyncThunk(
  'tasks/updateStatus',
  async ({ recommendationId, status }, { rejectWithValue }) => {
    try {
      const response = await recommendationAPI.updateRecommendationStatus(recommendationId, status);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update task status');
    }
  }
);

export const submitTaskFeedback = createAsyncThunk(
  'tasks/submitFeedback',
  async ({ recommendationId, feedbackData }, { rejectWithValue }) => {
    try {
      const response = await recommendationAPI.submitFeedback(recommendationId, feedbackData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit feedback');
    }
  }
);

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentTask: (state, action) => {
      state.currentTask = action.payload;
    },
    clearTasks: (state) => {
      state.tasks = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch recommendations
      .addCase(fetchRecommendations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecommendations.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload.recommendations;
      })
      .addCase(fetchRecommendations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Generate recommendations
      .addCase(generateRecommendations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateRecommendations.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload.recommendations;
      })
      .addCase(generateRecommendations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update status
      .addCase(updateTaskStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTaskStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.tasks.findIndex(t => t._id === action.payload.recommendation._id);
        if (index !== -1) {
          state.tasks[index] = action.payload.recommendation;
        }
        if (state.currentTask?._id === action.payload.recommendation._id) {
          state.currentTask = action.payload.recommendation;
        }
      })
      .addCase(updateTaskStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Submit feedback
      .addCase(submitTaskFeedback.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitTaskFeedback.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.tasks.findIndex(t => t._id === action.payload.recommendation._id);
        if (index !== -1) {
          state.tasks[index] = action.payload.recommendation;
        }
      })
      .addCase(submitTaskFeedback.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setCurrentTask, clearTasks } = taskSlice.actions;
export default taskSlice.reducer;
