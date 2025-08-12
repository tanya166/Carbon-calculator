import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://carbon-calculator-production.up.railway.app';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('🚨 401 Unauthorized - clearing session and redirecting to login');
      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('email');
      sessionStorage.removeItem('username');
      sessionStorage.removeItem('userId');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authUtils = {
  login: async (credentials) => {
    try {
      const response = await apiClient.post('/api/auth/login', credentials);
      
      console.log('=== LOGIN DEBUG START ===');
      console.log('Full login response:', response);
      console.log('Response data:', response.data);
      console.log('Response status:', response.status);
      console.log('=== LOGIN DEBUG END ===');
      
      const { token, userId, email, username } = response.data;
      
      console.log('Destructured values:');
      console.log('- token:', token ? 'Present' : 'Missing');
      console.log('- userId:', userId);
      console.log('- email:', email);
      console.log('- username:', username);
      
      if (token) {
        sessionStorage.setItem('authToken', token);
        console.log('✅ Stored authToken');
      }
      
      if (userId) {
        sessionStorage.setItem('userId', userId);
        console.log('✅ Stored userId:', userId);
      } else {
        console.error('❌ userId is missing from login response!');
      }
      
      if (email) {
        sessionStorage.setItem('email', email);
        console.log('✅ Stored email:', email);
      }
      
      if (username) {
        sessionStorage.setItem('username', username);
        console.log('✅ Stored username:', username);
      }
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  register: async (userData) => {
    try {
      const response = await apiClient.post('/api/auth/signup', userData);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  isAuthenticated: () => {
    return !!sessionStorage.getItem('authToken');
  },

  getCurrentUser: () => {
    const token = sessionStorage.getItem('authToken');
    const email = sessionStorage.getItem('email');
    const username = sessionStorage.getItem('username');
    const userId = sessionStorage.getItem('userId');
    
    return { token, email, username, userId };
  },

  logout: () => {
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('email');
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('userId');
    window.location.href = '/login';
  },

  getToken: () => {
    return sessionStorage.getItem('authToken');
  },

  // FIXED: Call the correct endpoint without userId parameter
  show: async () => {
    try {
      console.log('=== SHOW METHOD DEBUG START ===');
      
      const token = sessionStorage.getItem('authToken');
      
      console.log('Token present:', !!token);
      
      if (!token) {
        console.error('No authToken found in sessionStorage');
        throw new Error('Authentication token not found. Please log in again.');
      }

      // CORRECT: Call /api/form/submissions (no userId in URL)
      // Backend will get userId from JWT token in Authorization header
      console.log('Making API call to: /api/form/submissions');
      const response = await apiClient.get('/api/form/submissions');
      
      console.log('API Response:', response.data);
      console.log('=== SHOW METHOD DEBUG END ===');
      
      return response.data;
    } catch (error) {
      console.error('Error fetching user calculations:', error);
      
      // Enhanced error logging
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      
      throw error;
    }
  },

  // Optional: Add token verification method
  verifyToken: async () => {
    try {
      const response = await apiClient.get('/api/auth/verify');
      return response.data;
    } catch (error) {
      console.error('Token verification failed:', error);
      return false;
    }
  },

  // Optional: Add method to submit calculations
  submitCalculation: async (calculationData) => {
    try {
      const response = await apiClient.post('/api/form/submit', calculationData);
      return response.data;
    } catch (error) {
      console.error('Error submitting calculation:', error);
      throw error;
    }
  },

  // Optional: Add method to delete calculation
  deleteCalculation: async (calculationId) => {
    try {
      const response = await apiClient.delete(`/api/form/submissions/${calculationId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting calculation:', error);
      throw error;
    }
  }
};

export default apiClient;