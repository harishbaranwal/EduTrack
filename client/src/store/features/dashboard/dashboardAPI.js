import API from '../../../utils/api';

// Dashboard API endpoints
const dashboardAPI = {
  // Get admin dashboard
  getAdminDashboard: async () => {
    const response = await API.get('/dashboard/admin');
    return response.data;
  },

  // Get teacher dashboard
  getTeacherDashboard: async () => {
    const response = await API.get('/dashboard/teacher');
    return response.data;
  },

  // Get student dashboard
  getStudentDashboard: async () => {
    const response = await API.get('/dashboard/student');
    return response.data;
  },
};

export default dashboardAPI;
