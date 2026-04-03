// Base URL for all API requests — update this for production deployment
const BASE = 'http://localhost:8000';

// Retrieves the JWT token stored after login
function getToken() {
  return localStorage.getItem('arrivauk_token');
}

// General-purpose JSON request helper.
// Automatically attaches the auth token and Content-Type header.
// Throws an error (using the API's `detail` field if available) on non-2xx responses.
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

// Multipart/form-data request helper used for file uploads.
// Omits Content-Type so the browser can set the correct multipart boundary automatically.
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

// Auth — registration uses multipart (supports profile photo upload); login returns a JWT token
export const register = (formData) => uploadRequest('/users/register', formData);
export const login = (email, password) =>
  request('/users/login', { method: 'POST', body: JSON.stringify({ email, password }) });
export const getMe = () => request('/users/me');
export const updateProfile = (formData) => uploadRequest('/users/me', formData, 'PUT');

// Universities
export const getUniversities = (q = '') =>
  request(`/universities/${q ? `?q=${encodeURIComponent(q)}` : ''}`);

// Documents
export const getDocuments = () => request('/documents/');
export const seedDocuments = () => request('/documents/seed', { method: 'POST' });
export const updateDocumentStatus = (id, status) =>
  request(`/documents/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
export const createDocument = (data) =>
  request('/documents/', { method: 'POST', body: JSON.stringify(data) });
export const deleteDocument = (id) =>
  request(`/documents/${id}`, { method: 'DELETE' });

// Checklist — toggleComplete flips the completion status of a single item by ID
export const getChecklist = () => request('/checklist/');
export const seedChecklist = () => request('/checklist/seed', { method: 'POST' });
export const createChecklistItem = (data) =>
  request('/checklist/', { method: 'POST', body: JSON.stringify(data) });
export const toggleComplete = (id) =>
  request(`/checklist/${id}/complete`, { method: 'PATCH' });
export const deleteChecklistItem = (id) =>
  request(`/checklist/${id}`, { method: 'DELETE' });

// Local Guide
export const getGuide = () => request('/guide/');

// Deals
export const getDeals = () => request('/deals/');
export const seedDeals = () => request('/deals/seed', { method: 'POST' });

// Budget
export const getBudgetEntries = () => request('/budget/');
export const createBudgetEntry = (data) =>
  request('/budget/', { method: 'POST', body: JSON.stringify(data) });
export const deleteBudgetEntry = (id) =>
  request(`/budget/${id}`, { method: 'DELETE' });
export const getBudgetLimits = () => request('/budget/limits');
export const setBudgetLimit = (category, amount) =>
  request('/budget/limits', { method: 'PUT', body: JSON.stringify({ category, amount }) });
export const deleteBudgetLimit = (category) =>
  request(`/budget/limits/${encodeURIComponent(category)}`, { method: 'DELETE' });

// Users
export const createUser = (data) =>
  request('/users/', { method: 'POST', body: JSON.stringify(data) });
export const getUser = (id) => request(`/users/${id}`);

// Community
export const getPosts = (skip = 0, limit = 10) =>
  request(`/community/?skip=${skip}&limit=${limit}`);
export const createPost = (data) =>
  request('/community/', { method: 'POST', body: JSON.stringify(data) });
export const updatePost = (id, data) =>
  request(`/community/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deletePost = (id) =>
  request(`/community/${id}`, { method: 'DELETE' });
export const likePost = (id) =>
  request(`/community/${id}/like`, { method: 'POST' });
export const replyToPost = (id, data) =>
  request(`/community/${id}/reply`, { method: 'POST', body: JSON.stringify(data) });

// Resolves a stored filename to its full URL for use in <img> src or download links
export const getUploadUrl = (filename) => `${BASE}/uploads/${filename}`;
