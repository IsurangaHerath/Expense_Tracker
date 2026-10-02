import axios from 'axios';

const configuredBaseUrl = import.meta.env.VITE_API_URL || '/api/v1';

export const API_BASE_URL = configuredBaseUrl.endsWith('/api/v1')
  ? configuredBaseUrl
  : `${configuredBaseUrl.replace(/\/+$/, '')}/api/v1`;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor: add auth token if present
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

// Response interceptor: handle 401 unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Only redirect if not already on the login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ==========================================
// Authentication / User Profile API Methods
// ==========================================

export const loginUser = (email, password) => {
  return api.post('/auth/login', { email, password });
};

export const registerUser = (email, password) => {
  return api.post('/auth/register', { email, password });
};

export const logoutUser = () => {
  return api.post('/auth/logout');
};

export const changePassword = (passwordData) => {
  return api.post('/auth/change-password', passwordData);
};

// ==========================================
// Expense API Methods
// ==========================================

// Get all expenses
export const getExpenses = (params) => {
  return api.get('/expenses', { params });
};

// Get a single expense by ID
export const getExpenseById = (id) => {
  return api.get(`/expenses/${id}`);
};

// Create a new expense
export const createExpense = (expenseData) => {
  return api.post('/expenses/', expenseData);
};

// Update an existing expense
export const updateExpense = (id, expenseData) => {
  return api.put(`/expenses/${id}`, expenseData);
};

// Delete an expense
export const deleteExpense = (id) => {
  return api.delete(`/expenses/${id}`);
};

// ==========================================
// Dashboard API Methods
// ==========================================

// Get dashboard summary
export const getDashboardSummary = (params) => {
  return api.get('/dashboard/summary', { params });
};

// Get dashboard stats
export const getDashboardStats = () => {
  return api.get('/dashboard/stats');
};

// ==========================================
// Admin User Management API Methods
// ==========================================

// Get all users (supports optional search and filter params)
export const getUsers = (params) => {
  return api.get('/admin/users', { params });
};

// Get a single user by ID
export const getUserById = (id) => {
  return api.get(`/admin/users/${id}`);
};

// Update user details (e.g. email, role, status)
export const updateUser = (id, userData) => {
  return api.put(`/admin/users/${id}`, userData);
};

// Toggle user status (e.g. enable/disable account)
export const toggleUserStatus = (id, status) => {
  return api.patch(`/admin/users/${id}/status`, { status });
};

// Delete user account
export const deleteUser = (id) => {
  return api.delete(`/admin/users/${id}`);
};

export default api;