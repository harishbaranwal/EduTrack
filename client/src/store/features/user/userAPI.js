import API from '../../../utils/api';

// User API endpoints
const userAPI = {
  // Get all users
  getAllUsers: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await API.get(`/users?${params}`);
    return response.data;
  },

  // Get user by ID
  getUserById: async (userId) => {
    const response = await API.get(`/users/${userId}`);
    return response.data;
  },

  // Update user
  updateUser: async (userId, userData) => {
    const response = await API.put(`/users/${userId}`, userData);
    return response.data;
  },

  // Delete user
  deleteUser: async (userId) => {
    const response = await API.delete(`/users/${userId}`);
    return response.data;
  },

  // Get users by role
  getUsersByRole: async (role) => {
    const response = await API.get(`/users/role/${role}`);
    return response.data;
  },

  // Get students by batch
  getStudentsByBatch: async (batchId) => {
    const response = await API.get(`/users/batch/${batchId}/students`);
    return response.data;
  },

  // Update profile
  updateProfile: async (profileData) => {
    const response = await API.put('/users/profile', profileData);
    return response.data;
  },

  // Get user statistics
  getUserStats: async () => {
    const response = await API.get('/users/statistics');
    return response.data;
  },
};

export default userAPI;
