const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('COMPLAINT_PORTAL_TOKEN');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'API Request failed');
  }

  return data;
}

export const api = {
  // Auth
  login: (email, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  getMe: () => request('/auth/me'),

  // Complaints
  getComplaints: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/complaints?${query}`);
  },
  createComplaint: (formData) => request('/complaints', { method: 'POST', body: JSON.stringify(formData) }),
  checkDuplicates: (draftData) => request('/complaints/check-duplicates', { method: 'POST', body: JSON.stringify(draftData) }),
  updateStatus: (id, payload) => request(`/complaints/${id}/status`, { method: 'PATCH', body: JSON.stringify(payload) }),
  reassignTechnician: (id, payload) => request(`/complaints/${id}/reassign`, { method: 'PATCH', body: JSON.stringify(payload) }),
  addFeedback: (id, payload) => request(`/complaints/${id}/feedback`, { method: 'POST', body: JSON.stringify(payload) }),

  // Users
  getUsers: () => request('/users'),
  createUser: (userData) => request('/users', { method: 'POST', body: JSON.stringify(userData) }),
  toggleUserStatus: (id) => request(`/users/${id}/toggle-status`, { method: 'PATCH' }),
  assignSupervisorCategory: (id, categoryName) => request(`/users/${id}/assign-category`, { method: 'PATCH', body: JSON.stringify({ categoryName }) }),

  // Categories & Departments
  getCategories: () => request('/categories'),
  addCategory: (categoryName, description) => request('/categories', { method: 'POST', body: JSON.stringify({ categoryName, description }) }),

  // Presets
  getPresets: () => request('/presets'),
  addPreset: (categoryName, issueText) => request('/presets', { method: 'POST', body: JSON.stringify({ categoryName, issueText }) }),
  removePreset: (categoryName, issueText) => request('/presets', { method: 'DELETE', body: JSON.stringify({ categoryName, issueText }) }),

  // Audit Logs
  getAuditLogs: () => request('/audit-logs'),
};
