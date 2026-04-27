import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import notificationAPI from './notificationAPI';

const initialState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
};

// Async thunks
export const fetchUserNotifications = createAsyncThunk(
  'notification/fetchUser',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await notificationAPI.getUserNotifications(filters);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch notifications');
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  'notification/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationAPI.getUnreadCount();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch unread count');
    }
  }
);

export const markAsRead = createAsyncThunk(
  'notification/markAsRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      const response = await notificationAPI.markAsRead(notificationId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark as read');
    }
  }
);

export const markAllAsRead = createAsyncThunk(
  'notification/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationAPI.markAllAsRead();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark all as read');
    }
  }
);

export const createNotificationForAll = createAsyncThunk(
  'notification/createForAll',
  async (notificationData, { rejectWithValue }) => {
    try {
      const response = await notificationAPI.createNotificationForAll(notificationData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create notification');
    }
  }
);

export const createNotificationForSpecific = createAsyncThunk(
  'notification/createForSpecific',
  async (notificationData, { rejectWithValue }) => {
    try {
      const response = await notificationAPI.createNotificationForSpecific(notificationData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create notification');
    }
  }
);

export const createNotificationForBatch = createAsyncThunk(
  'notification/createForBatch',
  async (notificationData, { rejectWithValue }) => {
    try {
      const response = await notificationAPI.createNotificationForBatch(notificationData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create notification');
    }
  }
);

export const fetchAllNotifications = createAsyncThunk(
  'notification/fetchAll',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await notificationAPI.getAllNotifications(filters);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch notifications');
    }
  }
);

export const deleteNotification = createAsyncThunk(
  'notification/delete',
  async (notificationId, { rejectWithValue }) => {
    try {
      const response = await notificationAPI.deleteNotification(notificationId);
      return { notificationId, ...response };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete notification');
    }
  }
);

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      state.unreadCount += 1;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch user notifications
      .addCase(fetchUserNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload.data || [];
        // Calculate unread count
        state.unreadCount = (action.payload.data || []).filter(n => !n.isRead).length;
      })
      .addCase(fetchUserNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch unread count
      .addCase(fetchUnreadCount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.loading = false;
        state.unreadCount = action.payload.unreadCount;
      })
      .addCase(fetchUnreadCount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Mark as read
      .addCase(markAsRead.fulfilled, (state, action) => {
        const notification = state.notifications.find(n => n._id === action.meta.arg);
        if (notification && !notification.read) {
          notification.read = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      // Mark all as read
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.notifications.forEach(n => n.read = true);
        state.unreadCount = 0;
      })
      // Create notification for all
      .addCase(createNotificationForAll.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createNotificationForAll.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(createNotificationForAll.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create notification for specific
      .addCase(createNotificationForSpecific.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createNotificationForSpecific.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(createNotificationForSpecific.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create notification for batch
      .addCase(createNotificationForBatch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createNotificationForBatch.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(createNotificationForBatch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch all notifications (Admin)
      .addCase(fetchAllNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload.data || [];
      })
      .addCase(fetchAllNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete notification
      .addCase(deleteNotification.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = state.notifications.filter(n => n._id !== action.payload.notificationId);
      })
      .addCase(deleteNotification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, addNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
