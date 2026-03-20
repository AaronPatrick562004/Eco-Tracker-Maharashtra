// src/lib/api.ts
const API_BASE_URL = 'http://localhost:5000/api';

// Helper to get auth token
const getToken = () => localStorage.getItem('token');

// Generic fetch with error handling
async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const token = getToken();
  
  console.log(`🌐 Fetching: ${API_BASE_URL}${endpoint}`);
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `API request failed with status ${response.status}`);
  }

  return response.json();
}

// ==================== AUTH API ====================
export const authAPI = {
  login: (email: string, password: string) => 
    fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  
  getProfile: () => fetchAPI('/auth/me'),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

// ==================== DASHBOARD API ====================
export const dashboardAPI = {
  getStats: () => fetchAPI('/dashboard'),
  getMetrics: () => fetchAPI('/dashboard/metrics'),
  getRecentActivities: () => fetchAPI('/dashboard/recent-activities'),
};

// ==================== SCHOOL PORTAL API ====================
export const schoolsAPI = {
  getAll: () => fetchAPI('/school-portal'),
  getById: (id: string) => fetchAPI(`/school-portal/${id}`),
  getStats: () => fetchAPI('/school-portal/stats'),
  create: (data: any) => fetchAPI('/school-portal', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => fetchAPI(`/school-portal/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => fetchAPI(`/school-portal/${id}`, {
    method: 'DELETE',
  }),
};

// ==================== ACTIVITIES API ====================
export const activitiesAPI = {
  getAll: () => fetchAPI('/activity-logger'),
  getById: (id: string) => fetchAPI(`/activity-logger/${id}`),
  create: (data: any) => fetchAPI('/activity-logger', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => fetchAPI(`/activity-logger/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => fetchAPI(`/activity-logger/${id}`, {
    method: 'DELETE',
  }),
  approve: (id: string) => fetchAPI(`/activity-logger/${id}/approve`, {
    method: 'PUT',
  }),
  reject: (id: string) => fetchAPI(`/activity-logger/${id}/reject`, {
    method: 'PUT',
  }),
};

// ==================== MONITOR API (BEO/DEO) ====================
export const monitorAPI = {
  getBlocks: () => fetchAPI('/monitor/blocks'),
  getCompliance: () => fetchAPI('/monitor/compliance'),
  getSchools: () => fetchAPI('/monitor/schools'),
};

// ==================== RECOGNITION API ====================
export const recognitionAPI = {
  getAll: () => fetchAPI('/recognition'),
  getById: (id: string) => fetchAPI(`/recognition/${id}`),
  create: (data: any) => fetchAPI('/recognition', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => fetchAPI(`/recognition/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => fetchAPI(`/recognition/${id}`, {
    method: 'DELETE',
  }),
  // ✅ ADDED: like method for recognition
  like: (id: string) => fetchAPI(`/recognition/${id}/like`, {
    method: 'POST',
  }),
  // ✅ ADDED: unlike method if needed
  unlike: (id: string) => fetchAPI(`/recognition/${id}/unlike`, {
    method: 'POST',
  }),
};

// ==================== ECO-PASSPORTS API ====================
export const ecoPassportsAPI = {
  getStudents: () => fetchAPI('/eco-passports/students'),
  getStudentById: (id: string) => fetchAPI(`/eco-passports/students/${id}`),
  getBadges: () => fetchAPI('/eco-passports/badges'),
  createStudent: (data: any) => fetchAPI('/eco-passports/students', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateStudent: (id: string, data: any) => fetchAPI(`/eco-passports/students/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteStudent: (id: string) => fetchAPI(`/eco-passports/students/${id}`, {
    method: 'DELETE',
  }),
  addPoints: (studentId: string, points: number) => 
    fetchAPI(`/eco-passports/students/${studentId}/points`, {
      method: 'POST',
      body: JSON.stringify({ points }),
    }),
  awardBadge: (studentId: string, badgeId: string) => 
    fetchAPI(`/eco-passports/students/${studentId}/badges`, {
      method: 'POST',
      body: JSON.stringify({ badgeId }),
    }),
  // ✅ ADDED: get student badges
  getStudentBadges: (studentId: string) => 
    fetchAPI(`/eco-passports/students/${studentId}/badges`),
};

// ==================== ANALYTICS API ====================
export const analyticsAPI = {
  getDashboard: () => fetchAPI('/analytics/dashboard'),
  getDistricts: () => fetchAPI('/analytics/districts'),
  getBlocks: () => fetchAPI('/analytics/blocks'),
  getTrends: () => fetchAPI('/analytics/trends'),
  getActivityTypes: () => fetchAPI('/analytics/activity-types'),
  export: (format: 'pdf' | 'excel' | 'csv') => 
    fetchAPI(`/analytics/export?format=${format}`),
  // ✅ ADDED: get monthly data
  getMonthlyData: () => fetchAPI('/analytics/monthly'),
};

// ==================== COMMUNITY API ====================
export const communityAPI = {
  getPosts: () => fetchAPI('/community/posts'),
  getEvents: () => fetchAPI('/community/events'),
  getPostById: (id: string) => fetchAPI(`/community/posts/${id}`),
  createPost: (data: any) => fetchAPI('/community/posts', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updatePost: (id: string, data: any) => fetchAPI(`/community/posts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deletePost: (id: string) => fetchAPI(`/community/posts/${id}`, {
    method: 'DELETE',
  }),
  likePost: (id: string) => fetchAPI(`/community/posts/${id}/like`, {
    method: 'POST',
  }),
  unlikePost: (id: string) => fetchAPI(`/community/posts/${id}/unlike`, {
    method: 'POST',
  }),
  addComment: (postId: string, content: string) => 
    fetchAPI(`/community/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),
  getComments: (postId: string) => fetchAPI(`/community/posts/${postId}/comments`),
  deleteComment: (postId: string, commentId: string) => 
    fetchAPI(`/community/posts/${postId}/comments/${commentId}`, {
      method: 'DELETE',
    }),
};

// ==================== GOVERNMENT RESOLUTIONS API ====================
export const resolutionsAPI = {
  getAll: () => fetchAPI('/resolutions'),
  getRecent: () => fetchAPI('/resolutions/recent'),
  getById: (id: string) => fetchAPI(`/resolutions/${id}`),
  create: (data: any) => fetchAPI('/resolutions', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => fetchAPI(`/resolutions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => fetchAPI(`/resolutions/${id}`, {
    method: 'DELETE',
  }),
  // ✅ ADDED: download resolution
  download: (id: string) => fetchAPI(`/resolutions/${id}/download`),
};

// ==================== USERS API ====================
export const usersAPI = {
  getProfile: () => fetchAPI('/users/profile'),
  updateProfile: (data: any) => fetchAPI('/users/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  changePassword: (data: any) => fetchAPI('/users/change-password', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

// ==================== BADGES API ====================
export const badgesAPI = {
  getAll: () => fetchAPI('/badges'),
  getById: (id: string) => fetchAPI(`/badges/${id}`),
  create: (data: any) => fetchAPI('/badges', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => fetchAPI(`/badges/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => fetchAPI(`/badges/${id}`, {
    method: 'DELETE',
  }),
};