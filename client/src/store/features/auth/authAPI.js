import API from '../../../utils/api';

// Auth API endpoints
export const authAPI = {
  // Register new user
  register: async (userData) => {
    const response = await API.post('/auth/register', userData);
    return response.data;
  },

  // Verify OTP
  verifyOTP: async (otpData) => {
    const response = await API.post('/auth/verify-otp', otpData);
    return response.data;
  },

  // Resend OTP
  resendOTP: async (email) => {
    const response = await API.post('/auth/resend-otp', { email });
    return response.data;
  },

  // Login
  login: async (credentials) => {
    const response = await API.post('/auth/login', credentials);
    return response.data;
  },

  // Logout
  logout: async () => {
    const response = await API.post('/auth/logout');
    return response.data;
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await API.get('/auth/me');
    return response.data;
  },

  // Forgot password
  forgotPassword: async (email) => {
    const response = await API.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Validate reset token
  validateResetToken: async (token) => {
    const response = await API.get(`/auth/reset-password/${token}`);
    return response.data;
  },

  // Reset password
  resetPassword: async (token, password) => {
    const response = await API.post(`/auth/reset-password/${token}`, { password });
    return response.data;
  },

  // Update password
  updatePassword: async (passwords) => {
    const response = await API.put('/auth/password/update', passwords);
    return response.data;
  },

  // Update profile
  updateProfile: async (profileData) => {
    const response = await API.put('/auth/profile/update', profileData);
    return response.data;
  },
};

export default authAPI;