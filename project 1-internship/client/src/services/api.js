import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

// Request interceptor - attach token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getProfile: () => API.get('/auth/profile'),
  updateProfile: (data) => API.put('/auth/update', data),
  changePassword: (data) => API.put('/auth/change-password', data),
};

// Resource services
export const resourceService = {
  getAll: (params) => API.get('/resources', { params }),
  getById: (id) => API.get(`/resources/${id}`),
  upload: (data) => API.post('/resources/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => API.put(`/resources/${id}`, data),
  delete: (id) => API.delete(`/resources/${id}`),
  like: (id) => API.post(`/resources/${id}/like`),
  bookmark: (id) => API.post(`/resources/${id}/bookmark`),
  comment: (id, data) => API.post(`/resources/${id}/comment`, data),
  deleteComment: (id, commentId) => API.delete(`/resources/${id}/comment/${commentId}`),
  rate: (id, data) => API.post(`/resources/${id}/rate`, data),
  download: (id) => API.post(`/resources/${id}/download`),
  report: (id, data) => API.post(`/resources/${id}/report`, data),
  getMyUploads: () => API.get('/resources/my-uploads'),
  getTags: () => API.get('/resources/tags'),
};

// User services
export const userService = {
  getProfile: (id) => API.get(`/users/${id}`),
  getBookmarks: () => API.get('/users/bookmarks'),
  getDashboard: () => API.get('/users/dashboard'),
  getTopContributors: () => API.get('/users/top-contributors'),
};

// Admin services
export const adminService = {
  getAnalytics: () => API.get('/admin/analytics'),
  getUsers: (params) => API.get('/admin/users', { params }),
  banUser: (id) => API.put(`/admin/ban/${id}`),
  promoteUser: (id) => API.put(`/admin/promote/${id}`),
  getResources: (params) => API.get('/admin/resources', { params }),
  deleteResource: (id) => API.delete(`/admin/resource/${id}`),
  getReports: (params) => API.get('/admin/reports', { params }),
  updateReport: (id, data) => API.put(`/admin/reports/${id}`, data),
};

export default API;
