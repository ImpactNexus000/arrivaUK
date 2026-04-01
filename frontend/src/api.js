const BASE = 'http://localhost:8000';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

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
