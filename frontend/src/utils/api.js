import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/v1';

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

export const loginUser = (email, password) => {
  return api.post('/auth/login', { email, password });
};

export const registerUser = (email, password) => {
  return api.post('/auth/register', { email, password });
};

export const logoutUser = () => {
  return api.post('/auth/logout');
};

export default api;

//get all expenses
export const getExpenses = (params) =>{
  return api.get('/expenses',{params});
};

//get a single expenses by ID
export const getExpenseById = (id) =>{
  return api.get(`/expenses/${id}`);
};

//create a new expenses
export const createExpense = (expenseData) =>{
  return api.post('/expenses/',expenseData);
};

//update an exitiing expense
export const updateExpense = (id, expenseData) =>{
  return api.put(`/expenses/${id}`,expenseData);
};

// Delete an expense
export const deleteExpense = (id) => {
  return api.delete(`/expenses/${id}`);
};

// ==========================================
// Authentication / User Profile API Methods
// ==========================================

// Change user password
export const changePassword = (passwordData) => {
  return api.post('/auth/change-password', passwordData);
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