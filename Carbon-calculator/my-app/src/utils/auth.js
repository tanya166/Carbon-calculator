import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

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
      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('email');
      sessionStorage.removeItem('username');
      sessionStorage.removeItem('userId'); // FIX: Also remove userId on 401
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
    const userId = sessionStorage.getItem('userId'); // FIX: Also get userId
    
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

  show: async () => {
    try {
      const userId = sessionStorage.getItem('userId');
      console.log('Retrieved userId for show():', userId); // Debug log
      
      if (!userId) {
        console.error('No userId found in sessionStorage');
        throw new Error('User ID not found. Please log in again.');
      }
      
      const response = await apiClient.get(`/api/form/submissions/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user calculations:', error);
      throw error;
    }
  }
};

export default apiClient;