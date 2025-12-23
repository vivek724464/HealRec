import api from '@/lib/api';

export const authService = {
  requestSignupOtp: async (identifier, name, password, role) => {
    const response = await api.post('/users/signup', {
      identifier,
      name,
      password,
      role,
    });
    return response.data;
  },

  verifySignupOtp: async (identifier, otp) => {
    const response = await api.post('/users/verify-otp', {
      identifier,
      otp,
    });
    return response.data;
  },

  login: async (username, password) => {
    const response = await api.post('/users/login', {
      username,
      password,
    });

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Login failed');
    }

    const { token, user } = response.data;

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));

    return user;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    if (!user) return null;
    try {
      return JSON.parse(user);
    } catch {
      return null;
    }
  },

  getToken: () => {
    return localStorage.getItem('token');
  },
};
