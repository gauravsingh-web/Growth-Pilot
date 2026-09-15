import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Response interceptor for consistent error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.error || error.message || 'Network error';
    return Promise.reject(new Error(message));
  }
);

// Analytics
export const analyticsApi = {
  getSales: (period = 30) => api.get(`/analytics/sales?period=${period}`),
  getHourly: () => api.get('/analytics/hourly'),
  getDashboard: () => api.get('/analytics/dashboard'),
  getCategory: () => api.get('/analytics/category'),
};

// Customers
export const customersApi = {
  getAll: (params?: { segment?: string; limit?: number; offset?: number }) =>
    api.get('/customers', { params }),
  getSegments: () => api.get('/customers/segments'),
  getSummary: () => api.get('/customers/summary'),
  getById: (id: string) => api.get(`/customers/${id}`),
};

// Products
export const productsApi = {
  getAll: (params?: { sort?: string; order?: string }) => api.get('/products', { params }),
  getTop: (limit = 5) => api.get(`/products/top?limit=${limit}`),
  getSlow: () => api.get('/products/slow'),
};

// Campaigns
export const campaignsApi = {
  getAll: (status?: string) => api.get(`/campaigns${status ? `?status=${status}` : ''}`),
  create: (data: Record<string, unknown>) => api.post('/campaigns/create', data),
  launch: (id: string) => api.post(`/campaigns/${id}/launch`),
  pause: (id: string) => api.post(`/campaigns/${id}/pause`),
};

// AI
export const aiApi = {
  getInsights: () => api.get('/ai/insights'),
  getOpportunities: () => api.get('/ai/opportunities'),
  chat: (message: string) => api.post('/ai/chat', { message }),
  runGrowthMission: () => api.post('/ai/growth-mission'),
  getCampaignPreview: (insightId: string) => api.get(`/ai/campaign-preview/${insightId}`),
  markInsightRead: (id: string) => api.post(`/ai/mark-insight-read/${id}`),
};

// Actions
export const actionsApi = {
  getHistory: () => api.get('/actions/history'),
  createCampaign: (campaignData: Record<string, unknown>, insightId?: string) =>
    api.post('/actions/create-campaign', { campaignData, insightId }),
  createOffer: (offerData: Record<string, unknown>, insightId?: string) =>
    api.post('/actions/create-offer', { offerData, insightId }),
  sendMessage: (segment: string, message: string, channel?: string) =>
    api.post('/actions/send-customer-message', { segment, message, channel }),
  generateReport: () => api.post('/actions/generate-business-report'),
  undo: (id: string) => api.post(`/actions/undo/${id}`),
};

// Notifications
export const notificationsApi = {
  getAll: () => api.get('/notifications'),
  markRead: (id: string) => api.post(`/notifications/mark-read/${id}`),
  markAllRead: () => api.post('/notifications/mark-all-read'),
};

// Merchant
export const merchantApi = {
  get: () => api.get('/merchant'),
};

export default api;
