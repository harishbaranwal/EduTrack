import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
API.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
API.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Only redirect to login if we get 401 on a non-auth endpoint
    // Don't redirect if it's the getCurrentUser call or we're already on login/register pages
    const isAuthCheck = error.config?.url?.includes("/auth/me");
    const isOnAuthPage =
      window.location.pathname === "/login" ||
      window.location.pathname === "/register" ||
      window.location.pathname === "/verify-otp" ||
      window.location.pathname === "/" ||
      window.location.pathname === "/home";

    if (error.response?.status === 401 && !isAuthCheck && !isOnAuthPage) {
      // Handle unauthorized access - redirect to login
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default API;
