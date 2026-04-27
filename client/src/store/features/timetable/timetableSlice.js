import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import timetableAPI from './timetableAPI';

const initialState = {
  timetables: [],
  currentTimetable: null,
  todayClasses: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchAllTimetables = createAsyncThunk(
  'timetable/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await timetableAPI.getAllTimetables();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch timetables');
    }
  }
);

export const fetchTimetableByBatch = createAsyncThunk(
  'timetable/fetchByBatch',
  async (batchId, { rejectWithValue }) => {
    try {
      const response = await timetableAPI.getTimetableByBatch(batchId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch timetable');
    }
  }
);

export const fetchTeacherTimetable = createAsyncThunk(
  'timetable/fetchTeacher',
  async (_, { rejectWithValue }) => {
    try {
      const response = await timetableAPI.getTeacherTimetable();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch timetable');
    }
  }
);

export const fetchTeacherTodaySchedule = createAsyncThunk(
  'timetable/fetchTeacherToday',
  async (_, { rejectWithValue }) => {
    try {
      const response = await timetableAPI.getTeacherTodaySchedule();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch today schedule');
    }
  }
);

export const createTimetable = createAsyncThunk(
  'timetable/create',
  async (timetableData, { rejectWithValue }) => {
    try {
      const response = await timetableAPI.createTimetable(timetableData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create timetable');
    }
  }
);

export const updateTimetable = createAsyncThunk(
  'timetable/update',
  async ({ timetableId, timetableData }, { rejectWithValue }) => {
    try {
      const response = await timetableAPI.updateTimetable(timetableId, timetableData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update timetable');
    }
  }
);

export const deleteTimetable = createAsyncThunk(
  'timetable/delete',
  async (timetableId, { rejectWithValue }) => {
    try {
      const response = await timetableAPI.deleteTimetable(timetableId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete timetable');
    }
  }
);

const timetableSlice = createSlice({
  name: 'timetable',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentTimetable: (state, action) => {
      state.currentTimetable = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchAllTimetables.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllTimetables.fulfilled, (state, action) => {
        state.loading = false;
        state.timetables = action.payload.data;
      })
      .addCase(fetchAllTimetables.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch by batch
      .addCase(fetchTimetableByBatch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTimetableByBatch.fulfilled, (state, action) => {
        state.loading = false;
        state.timetables = action.payload.data || [];
        state.currentTimetable = action.payload.data?.[0] || null;
      })
      .addCase(fetchTimetableByBatch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch teacher
      .addCase(fetchTeacherTimetable.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTeacherTimetable.fulfilled, (state, action) => {
        state.loading = false;
        state.timetables = action.payload.data || [];
        state.currentTimetable = action.payload.data?.[0] || null;
      })
      .addCase(fetchTeacherTimetable.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Teacher Today Schedule
      .addCase(fetchTeacherTodaySchedule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTeacherTodaySchedule.fulfilled, (state, action) => {
        state.loading = false;
        state.todayClasses = action.payload.data;
      })
      .addCase(fetchTeacherTodaySchedule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create
      .addCase(createTimetable.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTimetable.fulfilled, (state, action) => {
        state.loading = false;
        state.timetables.push(action.payload.data);
      })
      .addCase(createTimetable.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update
      .addCase(updateTimetable.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTimetable.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTimetable = action.payload.data;
        const index = state.timetables.findIndex(t => t._id === action.payload.data._id);
        if (index !== -1) {
          state.timetables[index] = action.payload.data;
        }
      })
      .addCase(updateTimetable.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete
      .addCase(deleteTimetable.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTimetable.fulfilled, (state, action) => {
        state.loading = false;
        state.timetables = state.timetables.filter(t => t._id !== action.meta.arg);
        if (state.currentTimetable?._id === action.meta.arg) {
          state.currentTimetable = null;
        }
      })
      .addCase(deleteTimetable.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setCurrentTimetable } = timetableSlice.actions;
export default timetableSlice.reducer;
