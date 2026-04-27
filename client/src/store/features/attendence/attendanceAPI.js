import API from '../../../utils/api';

// Attendance API endpoints
const attendanceAPI = {
  // Mark attendance with QR code
  markAttendanceQR: async (data) => {
    const response = await API.post('/attendance/qr', data);
    return response.data;
  },

  // Mark attendance with location
  markAttendanceLocation: async (data) => {
    const response = await API.post('/attendance/location', data);
    return response.data;
  },

  // Get student attendance (uses authenticated user)
  getStudentAttendance: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await API.get(`/attendance/student/my-attendance?${params}`);
    return response.data;
  },

  // Get today's classes for location-based attendance
  getTodayClasses: async () => {
    const response = await API.get('/attendance/student/today-classes');
    return response.data;
  },

  // Get attendance by session
  getAttendanceBySession: async (sessionId) => {
    const response = await API.get(`/attendance/session/${sessionId}`);
    return response.data;
  },

  // Get attendance by batch
  getAttendanceByBatch: async (batchId, filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await API.get(`/attendance/batch/${batchId}?${params}`);
    return response.data;
  },

  // Get attendance statistics
  getAttendanceStats: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await API.get(`/attendance/stats?${params}`);
    return response.data;
  },

  // Get batch attendance statistics
  getBatchAttendanceStats: async (batchId, filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await API.get(`/attendance/batch/${batchId}/statistics?${params}`);
    return response.data;
  },

  // Get low attendance students
  getLowAttendanceStudents: async (batchId, threshold = 75) => {
    const response = await API.get(`/attendance/batch/${batchId}/low-attendance?threshold=${threshold}`);
    return response.data;
  },

  // Bulk mark attendance
  bulkMarkAttendance: async (data) => {
    const response = await API.post('/attendance/bulk-mark', data);
    return response.data;
  },

  // Update attendance
  updateAttendance: async (attendanceId, data) => {
    const response = await API.put(`/attendance/${attendanceId}`, data);
    return response.data;
  },

  // Delete attendance
  deleteAttendance: async (attendanceId) => {
    const response = await API.delete(`/attendance/${attendanceId}`);
    return response.data;
  },
};

export default attendanceAPI;
