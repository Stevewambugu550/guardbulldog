import axios from 'axios';

// Get API base URL from environment variable
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
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

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
  logout: () => api.post('/auth/logout'),
};

// Reports API calls
export const reportsAPI = {
  submitReport: (reportData) => {
    const formData = new FormData();
    Object.keys(reportData).forEach(key => {
      if (key === 'attachments' && reportData[key]) {
        Array.from(reportData[key]).forEach(file => {
          formData.append('attachments', file);
        });
      } else {
        formData.append(key, reportData[key]);
      }
    });
    return api.post('/reports', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getUserReports: (params) => api.get('/reports', { params }),
  getReportById: (id) => api.get(`/reports/${id}`),
  updateReportStatus: (id, status) => api.put(`/reports/${id}/status`, { status }),
  addAdminNote: (id, note) => api.post(`/reports/${id}/notes`, { note }),
  getTrendingThreats: () => api.get('/reports/stats'),
};

// Education API calls
export const educationAPI = {
  getModules: (params) => api.get('/education/modules', { params }),
  getModuleById: (id) => api.get(`/education/modules/${id}`),
  submitQuiz: (moduleId, answers) => api.post(`/education/modules/${moduleId}/quiz`, { answers }),
  getUserProgress: () => api.get('/education/progress'),
  createModule: (moduleData) => api.post('/education/modules', moduleData),
  updateModule: (id, moduleData) => api.put(`/education/modules/${id}`, moduleData),
  deleteModule: (id) => api.delete(`/education/modules/${id}`),
};

// Admin API calls
export const adminAPI = {
  getDashboardStats: () => api.get('/admin/stats'),
  getAllReports: (params) => api.get('/admin/reports', { params }),
  bulkUpdateReports: (reportIds, updates) => api.put('/admin/reports/bulk', { reportIds, updates }),
  exportReports: (params) => api.get('/admin/reports/export', { params }),
  getAllUsers: (params) => api.get('/admin/users', { params }),
  updateUserRole: (userId, role) => api.put(`/admin/users/${userId}/role`, { role }),
  getSystemHealth: () => api.get('/admin/health'),
  getAuditLogs: (params) => api.get('/admin/logs', { params }),
};

export default api;
