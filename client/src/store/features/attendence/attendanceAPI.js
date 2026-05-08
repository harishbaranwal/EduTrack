import API from '../../../utils/api';

// Attendance API endpoints
const attendanceAPI = {
  // Mark attendance with QR code (Stage 2 - after location verified)
  markAttendanceQR: async (data) => {
    const response = await API.post('/attendance/qr', data);
    return response.data;
  },

  // Verify student location against teacher (Stage 1)
  verifyLocation: async (data) => {
    const response = await API.post('/attendance/verify-location', data);
    return response.data;
  },

  // Get student attendance (uses authenticated user)
  getStudentAttendance: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await API.get(`/attendance/student/my-attendance?${params}`);
    return response.data;
  },

  // Get today's classes for attendance
  getTodayClasses: async () => {
    const response = await API.get('/attendance/student/today-classes');
    return response.data;
  },

  // Get attendance by session
  getAttendanceBySession: async (sessionId) => {
    const response = await API.get(`/attendance/session/${sessionId}`);
    return response.data;
  },

  // Get attendance statistics
  getAttendanceStats: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await API.get(`/attendance/stats?${params}`);
    return response.data;
  },

  // Bulk mark attendance
  bulkMarkAttendance: async (data) => {
    const response = await API.post('/attendance/bulk-mark', data);
    return response.data;
  },

  // Get teacher location status
  getTeacherLocationStatus: async (teacherId) => {
    const response = await API.get(`/attendance/teacher/location/${teacherId}`);
    return response.data;
  },
};

export default attendanceAPI;
