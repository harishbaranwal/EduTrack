import API from '../../../utils/api.js';

const recommendationAPI = {
  // Generate recommendations for a student
  generateRecommendations: async (studentId) => {
    const response = await API.post(`/recommendations/generate/${studentId}`);
    return response.data;
  },

  // Get all recommendations for a specific student with optional filters
  getStudentRecommendations: async (studentId, filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await API.get(`/recommendations/student/${studentId}?${params}`);
    return response.data;
  },

  // Get a specific recommendation by ID
  getRecommendationById: async (recommendationId) => {
    const response = await API.get(`/recommendations/${recommendationId}`);
    return response.data;
  },

  // Get recommendations by type (e.g., course, career, study)
  getRecommendationsByType: async (type) => {
    const response = await API.get(`/recommendations/type/${type}`);
    return response.data;
  },

  // Create a new recommendation (Admin/Teacher only)
  createRecommendation: async (data) => {
    const response = await API.post('/recommendations', data);
    return response.data;
  },

  // Update an existing recommendation
  updateRecommendation: async (id, data) => {
    const response = await API.put(`/recommendations/${id}`, data);
    return response.data;
  },

  // Update recommendation status (e.g., approved, completed, read)
  updateRecommendationStatus: async (recommendationId, status) => {
    const response = await API.patch(`/recommendations/${recommendationId}/status`, { status });
    return response.data;
  },

  // Mark recommendation as read
  markAsRead: async (recommendationId) => {
    const response = await API.patch(`/recommendations/${recommendationId}/read`);
    return response.data;
  },

  // Delete a recommendation
  deleteRecommendation: async (id) => {
    const response = await API.delete(`/recommendations/${id}`);
    return response.data;
  },

  // Get user analytics related to recommendations
  getUserAnalytics: async (userId) => {
    const response = await API.get(`/recommendations/analytics/${userId}`);
    return response.data;
  },
};

export default recommendationAPI;
