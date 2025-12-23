'use client';

import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor - add auth token and branch context
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add branch context header for data isolation
    // Read from localStorage where uiStore persists selectedBranch
    if (typeof window !== 'undefined') {
      try {
        const uiStorage = localStorage.getItem('ui-storage');
        if (uiStorage) {
          const parsed = JSON.parse(uiStorage);
          if (parsed?.state?.selectedBranch) {
            config.headers['X-Branch-Context'] = parsed.state.selectedBranch;
          }
        }
      } catch (e) {
        // Ignore parsing errors
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong';

    // Handle 401 - Unauthorized
    if (error.response?.status === 401) {
      Cookies.remove('token');
      Cookies.remove('user');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }

    return Promise.reject({ message, status: error.response?.status });
  }
);

export default api;

