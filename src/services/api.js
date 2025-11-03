import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

// Add request interceptor to include token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Reward Punishment Records API functions
export const rewardPunishmentRecordsApi = {
  // Bulk update records to done status
  bulkUpdateDone: async (recordIds, notes = null) => {
    const response = await api.post('/reward-punishment-records/bulk-update-done', {
      record_ids: recordIds,
      notes: notes
    });
    return response.data;
  },

  // Update single record
  update: async (id, data) => {
    const response = await api.put(`/reward-punishment-records/${id}`, data);
    return response.data;
  },

  // Get records for teacher
  index: async () => {
    const response = await api.get('/reward-punishment-records');
    return response.data;
  },

  // Get students with records
  getStudentsWithRecords: async (params = {}) => {
    const response = await api.get('/reward-punishment-records/students/list', { params });
    return response.data;
  }
};

export default api;