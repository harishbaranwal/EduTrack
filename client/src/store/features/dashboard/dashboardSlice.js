import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import dashboardAPI from './dashboardAPI';

const initialState = {
  dashboardData: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchAdminDashboard = createAsyncThunk(
  'dashboard/fetchAdmin',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardAPI.getAdminDashboard();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard');
    }
  }
);

export const fetchTeacherDashboard = createAsyncThunk(
  'dashboard/fetchTeacher',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardAPI.getTeacherDashboard();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard');
    }
  }
);

export const fetchStudentDashboard = createAsyncThunk(
  'dashboard/fetchStudent',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardAPI.getStudentDashboard();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard');
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearDashboard: (state) => {
      state.dashboardData = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Admin dashboard
      .addCase(fetchAdminDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboardData = action.payload.data;
      })
      .addCase(fetchAdminDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Teacher dashboard
      .addCase(fetchTeacherDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTeacherDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboardData = action.payload.data;
      })
      .addCase(fetchTeacherDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Student dashboard
      .addCase(fetchStudentDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudentDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboardData = action.payload.data;
      })
      .addCase(fetchStudentDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearDashboard } = dashboardSlice.actions;
export default dashboardSlice.reducer;
