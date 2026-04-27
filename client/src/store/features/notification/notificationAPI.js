import API from '../../../utils/api';

// Notification API endpoints
const notificationAPI = {
  // Create notification for all users
  createNotificationForAll: async (notificationData) => {
    const response = await API.post('/notifications/all', notificationData);
    return response.data;
  },

  // Create notification for specific users
  createNotificationForSpecific: async (notificationData) => {
    const response = await API.post('/notifications/specific', notificationData);
    return response.data;
  },

  // Create notification for batch
  createNotificationForBatch: async (notificationData) => {
    const response = await API.post('/notifications/batch', notificationData);
    return response.data;
  },

  // Get all notifications (Admin only)
  getAllNotifications: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null) {
        params.append(key, filters[key]);
      }
    });
    const response = await API.get(`/notifications/all?${params}`);
    return response.data;
  },

  // Get user notifications
  getUserNotifications: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null) {
        params.append(key, filters[key]);
      }
    });
    const response = await API.get(`/notifications?${params}`);
    return response.data;
  },

  // Get notification by ID
  getNotificationById: async (notificationId) => {
    const response = await API.get(`/notifications/${notificationId}`);
    return response.data;
  },

  // Mark as read
  markAsRead: async (notificationId) => {
    const response = await API.patch(`/notifications/${notificationId}/read`);
    return response.data;
  },

  // Mark all as read
  markAllAsRead: async () => {
    const response = await API.patch('/notifications/read/all');
    return response.data;
  },

  // Delete notification (Admin only)
  deleteNotification: async (notificationId) => {
    const response = await API.delete(`/notifications/${notificationId}`);
    return response.data;
  },

  // Get notification stats (Admin only)
  getNotificationStats: async (userId = null) => {
    const params = userId ? `?userId=${userId}` : '';
    const response = await API.get(`/notifications/stats${params}`);
    return response.data;
  },
};

export default notificationAPI;
