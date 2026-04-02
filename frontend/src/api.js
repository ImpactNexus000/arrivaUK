const BASE = 'http://localhost:8000';

function getToken() {
  return localStorage.getItem('arrivauk_token');
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `${res.status} ${res.statusText}`);
  }
  return res.json();
}

async function uploadRequest(path, formData, method = 'POST') {
  const token = getToken();
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, { method, headers, body: formData });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `${res.status} ${res.statusText}`);
  }
  return res.json();
}

// Auth
export const register = (formData) => uploadRequest('/users/register', formData);
export const login = (email, password) =>
  request('/users/login', { method: 'POST', body: JSON.stringify({ email, password }) });
export const getMe = () => request('/users/me');
export const updateProfile = (formData) => uploadRequest('/users/me', formData, 'PUT');

// Checklist
export const getChecklist = () => request('/checklist/');
export const createChecklistItem = (data) =>
  request('/checklist/', { method: 'POST', body: JSON.stringify(data) });
export const toggleComplete = (id) =>
  request(`/checklist/${id}/complete`, { method: 'PATCH' });

// Deals
export const getDeals = () => request('/deals/');
export const createDeal = (data) =>
  request('/deals/', { method: 'POST', body: JSON.stringify(data) });

// Budget
export const getBudgetEntries = () => request('/budget/');
export const createBudgetEntry = (data) =>
  request('/budget/', { method: 'POST', body: JSON.stringify(data) });
export const deleteBudgetEntry = (id) =>
  request(`/budget/${id}`, { method: 'DELETE' });

// Users
export const createUser = (data) =>
  request('/users/', { method: 'POST', body: JSON.stringify(data) });
export const getUser = (id) => request(`/users/${id}`);

// Community
export const getPosts = () => request('/community/');
export const createPost = (data) =>
  request('/community/', { method: 'POST', body: JSON.stringify(data) });
export const likePost = (id) =>
  request(`/community/${id}/like`, { method: 'POST' });
export const replyToPost = (id, data) =>
  request(`/community/${id}/reply`, { method: 'POST', body: JSON.stringify(data) });

// Uploads URL helper
export const getUploadUrl = (filename) => `${BASE}/uploads/${filename}`;
