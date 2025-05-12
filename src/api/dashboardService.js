// api/dashboardService.js
import axios from 'axios';

// Base API URL - replace with your actual API base URL
const BASE_URL = process.env.REACT_APP_API_URL || 'https://api.example.com';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Add request interceptor for auth tokens
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Handle specific error cases (e.g., 401, 403, etc.)
    if (error.response) {
      if (error.response.status === 401) {
        // Handle unauthorized (e.g., redirect to login)
        console.error('Unauthorized access. Please login again.');
        // You might want to trigger a logout action or redirect
      }
    }
    return Promise.reject(error);
  }
);

// Dashboard API services
export const dashboardApi = {
  // Fetch dashboard stats
  fetchStats: async () => {
    try {
      return await apiClient.get('/dashboard/stats');
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  },
  
  // Fetch user growth data with period parameter
  fetchUserGrowth: async (period = 'monthly') => {
    try {
      return await apiClient.get(`/dashboard/user-growth?period=${period}`);
    } catch (error) {
      console.error('Error fetching user growth data:', error);
      throw error;
    }
  },
  
  // Fetch user distribution data
  fetchUserDistribution: async () => {
    try {
      return await apiClient.get('/dashboard/user-distribution');
    } catch (error) {
      console.error('Error fetching user distribution data:', error);
      throw error;
    }
  },
  
  // Fetch revenue data with period parameter
  fetchRevenueData: async (period = 'monthly') => {
    try {
      return await apiClient.get(`/dashboard/revenue?period=${period}`);
    } catch (error) {
      console.error('Error fetching revenue data:', error);
      throw error;
    }
  },
  
  // Fetch conversion rate data with period parameter
  fetchConversionRate: async (period = 'monthly') => {
    try {
      return await apiClient.get(`/dashboard/conversion-rate?period=${period}`);
    } catch (error) {
      console.error('Error fetching conversion rate data:', error);
      throw error;
    }
  },
  
  // Fetch user engagement data
  fetchUserEngagement: async () => {
    try {
      return await apiClient.get('/dashboard/user-engagement');
    } catch (error) {
      console.error('Error fetching user engagement data:', error);
      throw error;
    }
  },
  
  // Fetch recent activity data
  fetchRecentActivity: async (limit = 4) => {
    try {
      return await apiClient.get(`/dashboard/recent-activity?limit=${limit}`);
    } catch (error) {
      console.error('Error fetching recent activity data:', error);
      throw error;
    }
  },

  // Export dashboard data
  exportDashboardData: async (format = 'csv', period = 'monthly') => {
    try {
      return await apiClient.get(`/dashboard/export?format=${format}&period=${period}`, {
        responseType: 'blob', // Important for handling file downloads
      });
    } catch (error) {
      console.error('Error exporting dashboard data:', error);
      throw error;
    }
  }
};

export default dashboardApi;