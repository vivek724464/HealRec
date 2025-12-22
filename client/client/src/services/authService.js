import api from '@/lib/api';

export const authService = {
  requestSignupOtp: async (identifier, name, password, role) => {
    try {
      const response = await api.post('/users/signup', {
        identifier,
        name,
        password,
        role,
      });
      return response.data;
    } catch (error) {
      console.error('Signup OTP error:', error);
      throw error;
    }
  },

  verifySignupOtp: async (identifier, otp) => {
    try {
      const response = await api.post('/users/verify-otp', {
        identifier,
        otp,
      });
      return response.data;
    } catch (error) {
      console.error('Verify OTP error:', error);
      throw error;
    }
  },

  login: async (username, password) => {
    try {
      const response = await api.post('/users/login', {
        username,
        password,
      });
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  searchUsers: async (query) => {
    return await api.get(`/users/search?username=${query}`);
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    if (user) return JSON.parse(user);

    // Fallback: try to decode JWT token stored in localStorage
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      const decoded = JSON.parse(jsonPayload);
      // normalized user object
      return { _id: decoded.id || decoded._id, id: decoded.id || decoded._id, role: decoded.role };
    } catch (err) {
      return null;
    }
  },

  getToken: () => {
    return localStorage.getItem('token');
  },
};