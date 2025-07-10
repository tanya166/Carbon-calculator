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
      window.location.href = '/login';
    }
    return Promise.reject(error);
    
  }
);
export const authUtils = {
  login: async (credentials) => {
    try {
      const response = await apiClient.post('/api/auth/login', credentials);
      const { token, user, email ,username} = response.data;
      if (token) {
        sessionStorage.setItem('authToken', token);
      }
      const userId = user?.id || user?.userId || user?._id;
      if (userId) {
        sessionStorage.setItem('userId', userId);
      }
      if (email) {
        sessionStorage.setItem('email', email);
      }
      if (username) {
        sessionStorage.setItem('username', username);
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
    return { token, email , username };
  },
  logout: () => {
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('email');
    window.location.href = '/login';
  },
  getToken: () => {
    return sessionStorage.getItem('authToken');
  },
  show: async()=>{
    try{
      const userId = sessionStorage.getItem('userId');
      if (!userId) {
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