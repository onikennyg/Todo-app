import axios, { AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";
import { toast } from "react-toastify";

const custom_axios = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: 15000, // Increased timeout
});

// Add request interceptor for JWT token
custom_axios.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Don't add token for login and signup endpoints
    if (config.url && !['/auth/login', '/user/signUp'].includes(config.url)) {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    toast.error("Error setting up request");
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
custom_axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      // Network error or server not responding
      if (error.code === 'ECONNABORTED') {
        toast.error("Request timed out. Please try again.");
      } else {
        toast.error("Cannot connect to server. Please check your internet connection.");
      }
      return Promise.reject(error);
    }

    // Handle specific HTTP status codes
    switch (error.response.status) {
      case 400:
        toast.error(error.response.data.message || "Invalid request");
        break;
      case 401:
        if (!window.location.pathname.includes('/login')) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        toast.error(error.response.data.message || "Authentication failed");
        break;
      case 403:
        toast.error("Access denied");
        break;
      case 404:
        toast.error("Resource not found");
        break;
      case 500:
        toast.error("Server error. Please try again later.");
        break;
      default:
        toast.error(error.response.data.message || "An unexpected error occurred");
    }
    
    return Promise.reject(error);
  }
);

export default custom_axios;