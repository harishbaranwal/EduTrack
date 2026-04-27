import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import attendanceReducer from './features/attendence/attendanceSlice';
import timetableReducer from './features/timetable/timetableSlice';
import taskReducer from './features/tasks/taskSlice';
import batchReducer from './features/batch/batchSlice';
import notificationReducer from './features/notification/notificationSlice';
import dashboardReducer from './features/dashboard/dashboardSlice';
import userReducer from './features/user/userSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    attendance: attendanceReducer,
    timetable: timetableReducer,
    tasks: taskReducer,
    batch: batchReducer,
    notification: notificationReducer,
    dashboard: dashboardReducer,
    user: userReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
