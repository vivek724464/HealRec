import api from '@/lib/api';

export const dataService = {
  // Report endpoints
  uploadReport: async (formData) => {
    try {
      const response = await api.post('/reports/uploadReport', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading report:', error);
      throw error;
    }
  },

  getReports: async (patientId) => {
    try {
      const response = await api.get(`/reports/${patientId}`);
      // server returns { reports: [...] } — normalize to { data: [...] }
      return { data: response.data.reports || [] };
    } catch (error) {
      console.error('Error fetching reports:', error);
      throw error;
    }
  },

  // Follow endpoints
  getFollowingDoctors: async () => {
    try {
      const response = await api.get('/followers/get-followed-doctors');
      return response.data;
    } catch (error) {
      console.error('Error fetching following doctors:', error);
      throw error;
    }
  },

  sendFollowRequest: async (doctorId) => {
    try {
      const response = await api.post('/followers/follow-request', { doctorId });
      return response.data;
    } catch (error) {
      console.error('Error sending follow request:', error);
      throw error;
    }
  },

  getPendingRequests: async () => {
    try {
      const response = await api.get('/followers/get-Pending-requests');
      return response.data;
    } catch (error) {
      console.error('Error fetching pending requests:', error);
      throw error;
    }
  },

  getDoctorPatients: async () => {
    try {
      const response = await api.get('/followers/get-followers');
      return response.data;
    } catch (error) {
      console.error('Error fetching followers:', error);
      throw error;
    }
  },

  acceptFollowRequest: async (patientId) => {
    try {
      const response = await api.post('/followers/accept-request', { patientId });
      return response.data;
    } catch (error) {
      console.error('Error accepting follow request:', error);
      throw error;
    }
  },

  declineFollowRequest: async (patientId) => {
    try {
      const response = await api.post('/followers/decline-request', { patientId });
      return response.data;
    } catch (error) {
      console.error('Error declining follow request:', error);
      throw error;
    }
  },

  // Get available doctors - return empty for now as backend doesn't have this
  getAvailableDoctors: async () => {
    try {
      // Backend doesn't have an "available doctors" endpoint
      // You'll need to add this to the backend or use followers list
      return { data: [] };
    } catch (error) {
      console.error('Error fetching available doctors:', error);
      throw error;
    }
  },

  getSharedRecords: async () => {
    try {
      return { data: [] };
    } catch (error) {
      console.error('Error fetching shared records:', error);
      throw error;
    }
  },

  // Chat endpoints
  getChatHistory: async (userId, partnerId) => {
    try {
      // Chat functionality would need to be implemented in backend
      return { data: [] };
    } catch (error) {
      console.error('Error fetching chat history:', error);
      throw error;
    }
  },

  getUserChats: async () => {
    try {
      return { data: [] };
    } catch (error) {
      console.error('Error fetching user chats:', error);
      throw error;
    }
  },

  sendMessage: async (receiverId, content, attachment = null) => {
    try {
      return { data: null };
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },
};
