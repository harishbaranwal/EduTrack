import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import batchAPI from './batchAPI';

const initialState = {
  batches: [],
  currentBatch: null,
  students: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchAllBatches = createAsyncThunk(
  'batch/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await batchAPI.getAllBatches();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch batches');
    }
  }
);

export const fetchBatchById = createAsyncThunk(
  'batch/fetchById',
  async (batchId, { rejectWithValue }) => {
    try {
      const response = await batchAPI.getBatchById(batchId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch batch');
    }
  }
);

export const createBatch = createAsyncThunk(
  'batch/create',
  async (batchData, { rejectWithValue }) => {
    try {
      const response = await batchAPI.createBatch(batchData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create batch');
    }
  }
);

export const updateBatch = createAsyncThunk(
  'batch/update',
  async ({ batchId, batchData }, { rejectWithValue }) => {
    try {
      const response = await batchAPI.updateBatch(batchId, batchData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update batch');
    }
  }
);

export const deleteBatch = createAsyncThunk(
  'batch/delete',
  async (batchId, { rejectWithValue }) => {
    try {
      const response = await batchAPI.deleteBatch(batchId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete batch');
    }
  }
);

export const fetchBatchStudents = createAsyncThunk(
  'batch/fetchStudents',
  async (batchId, { rejectWithValue }) => {
    try {
      const response = await batchAPI.getBatchStudents(batchId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch students');
    }
  }
);

export const addStudentsToBatch = createAsyncThunk(
  'batch/addStudents',
  async ({ batchId, studentIds }, { rejectWithValue }) => {
    try {
      const response = await batchAPI.addStudentsToBatch(batchId, studentIds);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add students to batch');
    }
  }
);

export const removeStudentFromBatch = createAsyncThunk(
  'batch/removeStudent',
  async ({ batchId, studentId }, { rejectWithValue }) => {
    try {
      const response = await batchAPI.removeStudent(batchId, studentId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove student from batch');
    }
  }
);

const batchSlice = createSlice({
  name: 'batch',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentBatch: (state, action) => {
      state.currentBatch = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchAllBatches.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllBatches.fulfilled, (state, action) => {
        state.loading = false;
        state.batches = action.payload.data;
      })
      .addCase(fetchAllBatches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch by ID
      .addCase(fetchBatchById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBatchById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBatch = action.payload.data;
      })
      .addCase(fetchBatchById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create
      .addCase(createBatch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBatch.fulfilled, (state, action) => {
        state.loading = false;
        state.batches.push(action.payload.data);
      })
      .addCase(createBatch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update
      .addCase(updateBatch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBatch.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.batches.findIndex(b => b._id === action.payload.data._id);
        if (index !== -1) {
          state.batches[index] = action.payload.data;
        }
        if (state.currentBatch?._id === action.payload.data._id) {
          state.currentBatch = action.payload.data;
        }
      })
      .addCase(updateBatch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete
      .addCase(deleteBatch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBatch.fulfilled, (state, action) => {
        state.loading = false;
        state.batches = state.batches.filter(b => b._id !== action.meta.arg);
        if (state.currentBatch?._id === action.meta.arg) {
          state.currentBatch = null;
        }
      })
      .addCase(deleteBatch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch students
      .addCase(fetchBatchStudents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBatchStudents.fulfilled, (state, action) => {
        state.loading = false;
        state.students = action.payload.students;
      })
      .addCase(fetchBatchStudents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add students to batch
      .addCase(addStudentsToBatch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addStudentsToBatch.fulfilled, (state, action) => {
        state.loading = false;
        // Update the batch in the batches array
        const index = state.batches.findIndex(b => b._id === action.payload.data._id);
        if (index !== -1) {
          state.batches[index] = action.payload.data;
        }
        // Update current batch if it's the same
        if (state.currentBatch?._id === action.payload.data._id) {
          state.currentBatch = action.payload.data;
        }
      })
      .addCase(addStudentsToBatch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Remove student from batch
      .addCase(removeStudentFromBatch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeStudentFromBatch.fulfilled, (state, action) => {
        state.loading = false;
        // Update the batch in the batches array
        const index = state.batches.findIndex(b => b._id === action.payload.data._id);
        if (index !== -1) {
          state.batches[index] = action.payload.data;
        }
        // Update current batch if it's the same
        if (state.currentBatch?._id === action.payload.data._id) {
          state.currentBatch = action.payload.data;
        }
        // Update students list by removing the student
        state.students = state.students.filter(s => s._id !== action.meta.arg.studentId);
      })
      .addCase(removeStudentFromBatch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setCurrentBatch } = batchSlice.actions;
export default batchSlice.reducer;
