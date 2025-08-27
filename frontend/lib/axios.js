import axios from 'axios';

// Configure axios base URL based on environment
const baseURL = import.meta.env.VITE_API_URL || 'https://akrgroupofcompany-bjvw.onrender.com';

// Create axios instance with base URL
const api = axios.create({
  baseURL: baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for auth tokens
api.interceptors.request.use(
  (config) => {
    // Check for construction admin token first, then regular admin token
    const constructionToken = localStorage.getItem('constructionAdminToken');
    const adminToken = localStorage.getItem('adminToken');
    
    if (constructionToken) {
      config.headers.Authorization = `Bearer ${constructionToken}`;
    } else if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('constructionAdminToken');
      localStorage.removeItem('adminRole');
      window.location.href = '/admin-login';
    }
    return Promise.reject(error);
  }
);

export default api; 