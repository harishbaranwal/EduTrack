import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import attendanceAPI from './attendanceAPI';

const initialState = {
  attendanceList: [],
  currentAttendance: null,
  todayClasses: [],
  stats: null,
  loading: false,
  error: null,
};

// Async thunks
export const markAttendanceQR = createAsyncThunk(
  'attendance/markQR',
  async (data, { rejectWithValue }) => {
    try {
      const response = await attendanceAPI.markAttendanceQR(data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark attendance');
    }
  }
);

export const markAttendanceLocation = createAsyncThunk(
  'attendance/markLocation',
  async (data, { rejectWithValue }) => {
    try {
      const response = await attendanceAPI.markAttendanceLocation(data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark attendance');
    }
  }
);

export const fetchStudentAttendance = createAsyncThunk(
  'attendance/fetchStudent',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await attendanceAPI.getStudentAttendance(filters);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch attendance');
    }
  }
);

export const fetchTodayClasses = createAsyncThunk(
  'attendance/fetchTodayClasses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await attendanceAPI.getTodayClasses();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch today classes');
    }
  }
);

export const fetchAttendanceBySession = createAsyncThunk(
  'attendance/fetchBySession',
  async (sessionId, { rejectWithValue }) => {
    try {
      const response = await attendanceAPI.getAttendanceBySession(sessionId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch attendance');
    }
  }
);

export const fetchAttendanceStats = createAsyncThunk(
  'attendance/fetchStats',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await attendanceAPI.getAttendanceStats(filters);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch statistics');
    }
  }
);

export const bulkMarkAttendance = createAsyncThunk(
  'attendance/bulkMark',
  async (data, { rejectWithValue }) => {
    try {
      const response = await attendanceAPI.bulkMarkAttendance(data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark bulk attendance');
    }
  }
);

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearAttendance: (state) => {
      state.attendanceList = [];
      state.currentAttendance = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Mark QR
      .addCase(markAttendanceQR.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(markAttendanceQR.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAttendance = action.payload.data;
      })
      .addCase(markAttendanceQR.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Mark Location
      .addCase(markAttendanceLocation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(markAttendanceLocation.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAttendance = action.payload.data;
      })
      .addCase(markAttendanceLocation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch student attendance
      .addCase(fetchStudentAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudentAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.attendanceList = action.payload.data?.attendance || [];
        state.stats = action.payload.data?.statistics || null;
      })
      .addCase(fetchStudentAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch by session
      .addCase(fetchAttendanceBySession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAttendanceBySession.fulfilled, (state, action) => {
        state.loading = false;
        state.attendanceList = action.payload.data;
      })
      .addCase(fetchAttendanceBySession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch stats
      .addCase(fetchAttendanceStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAttendanceStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.statistics;
      })
      .addCase(fetchAttendanceStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Bulk mark
      .addCase(bulkMarkAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(bulkMarkAttendance.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(bulkMarkAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch today classes
      .addCase(fetchTodayClasses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTodayClasses.fulfilled, (state, action) => {
        state.loading = false;
        state.todayClasses = action.payload.data.classes || [];
      })
      .addCase(fetchTodayClasses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearAttendance } = attendanceSlice.actions;
export default attendanceSlice.reducer;
