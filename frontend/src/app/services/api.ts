import axios from 'axios';

// ─── Axios instance with base config ─────────────────────────────────────────
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  timeout: 45000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Token storage ────────────────────────────────────────────────────────────
export const TOKEN_KEY = 'rishtaai_token';
export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);
export const saveToken = (token: string): void => localStorage.setItem(TOKEN_KEY, token);
export const removeToken = (): void => localStorage.removeItem(TOKEN_KEY);

// ─── Attach token to every request ───────────────────────────────────────────
// DEPRECATED: No longer needed as we use withCredentials for cookies
axiosInstance.interceptors.request.use((config) => {
  console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

// ─── Handle 401 responses (session expired) ───────────────────────────────────
axiosInstance.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    const url: string = err.config?.url ?? '';
    const isAuthRoute = url.includes('/auth/');

    // If 401 on a protected route, the cookie is likely expired/invalid
    if (status === 401 && !isAuthRoute) {
      removeToken(); // Clear local state backup
      window.dispatchEvent(new CustomEvent('auth:session-expired'));
    }
    return Promise.reject(err);
  }
);

// ─── Auth API ────────────────────────────────────────────────────────────────
export const authAPI = {
  login: async (email: string, password: string) => {
    const res = await axiosInstance.post('/auth/login', { email, password });
    return res.data; // { success, message, data: { user, accessToken } }
  },

  register: async (payload: FormData) => {
    const res = await axiosInstance.post('/auth/register', payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  getMe: async () => {
    const res = await axiosInstance.get('/auth/me');
    return res.data; // { success, message, data: { user } }
  },

  logout: async () => {
    try {
      await axiosInstance.post('/auth/logout');
    } catch { /* ignore */ }
  },

  forgotPassword: async (email: string) => {
    const res = await axiosInstance.post('/auth/forgot-password', { email });
    return res.data;
  },

  resetPassword: async (token: string, password: string) => {
    const res = await axiosInstance.post(`/auth/reset-password/${token}`, { password });
    return res.data;
  },
};

// ─── Profile API ─────────────────────────────────────────────────────────────
export const profileAPI = {
  getMe: async () => {
    const res = await axiosInstance.get('/profile/me');
    return res.data;
  },

  getPublic: async (userId: string) => {
    const res = await axiosInstance.get(`/profile/${userId}`);
    return res.data;
  },

  update: async (payload: Record<string, any>) => {
    const res = await axiosInstance.put('/profile/me', payload);
    return res.data;
  },

  stats: async () => {
    const res = await axiosInstance.get('/profile/me/stats');
    return res.data;
  },

  updatePreferences: async (payload: Record<string, any>) => {
    const res = await axiosInstance.put('/profile/me/preferences', payload);
    return res.data;
  },

  updateNotifications: async (payload: Record<string, boolean>) => {
    const res = await axiosInstance.put('/profile/me/notifications', payload);
    return res.data;
  },

  uploadPhoto: async (file: File) => {
    const form = new FormData();
    form.append('photo', file);
    const res = await axiosInstance.post('/profile/me/photo', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  deleteAccount: async () => {
    const res = await axiosInstance.delete('/profile/me');
    return res.data;
  },
};

// ─── Match API ───────────────────────────────────────────────────────────────
export const matchAPI = {
  getMyMatches: async () => {
    const res = await axiosInstance.get('/matches');
    return res.data;
  },

  explore: async (params: Record<string, string | number> = {}) => {
    const res = await axiosInstance.get('/matches/explore', { params });
    return res.data;
  },

  regenerate: async () => {
    const res = await axiosInstance.post('/matches/regenerate');
    return res.data;
  },
};

// ─── AI API ──────────────────────────────────────────────────────────────────
export const aiAPI = {
  generateReport: async (targetUserId: string) => {
    const res = await axiosInstance.post('/ai/compatibility-report', { targetUserId });
    return res.data;
  },

  getStarInsight: async (targetUserId: string) => {
    const res = await axiosInstance.get(`/ai/star-insight/${targetUserId}`);
    return res.data;
  },

  checkGuestCompatibility: async (payload: FormData) => {
    const res = await axiosInstance.post('/ai/guest-compatibility', payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  createGuestSession: async (dataA: any) => {
    const res = await axiosInstance.post('/ai/guest-session', { dataA });
    return res.data;
  },

  getGuestSession: async (sessionId: string) => {
    const res = await axiosInstance.get(`/ai/guest-session/${sessionId}`);
    return res.data;
  },

  completeGuestSession: async (sessionId: string, dataB: any) => {
    const res = await axiosInstance.post(`/ai/guest-session/${sessionId}/complete`, { dataB });
    return res.data;
  },
};

// ─── Connection API ───────────────────────────────────────────────────────────
export const connectionAPI = {
  send: async (targetUserId: string, message?: string) => {
    const res = await axiosInstance.post(`/connections/send/${targetUserId}`, { message });
    return res.data;
  },

  accept: async (requestId: string) => {
    const res = await axiosInstance.post(`/connections/accept/${requestId}`);
    return res.data;
  },

  decline: async (requestId: string) => {
    const res = await axiosInstance.post(`/connections/decline/${requestId}`);
    return res.data;
  },

  getReceived: async () => {
    const res = await axiosInstance.get('/connections/received');
    return res.data;
  },

  getSent: async () => {
    const res = await axiosInstance.get('/connections/sent');
    return res.data;
  },
};

// ─── Chat API ─────────────────────────────────────────────────────────────────
export const chatAPI = {
  getConversations: async () => {
    const res = await axiosInstance.get('/chat/conversations');
    return res.data;
  },

  getMessages: async (conversationId: string, page = 1) => {
    const res = await axiosInstance.get(`/chat/conversations/${conversationId}/messages`, {
      params: { page, limit: 30 },
    });
    return res.data;
  },

  markRead: async (conversationId: string) => {
    const res = await axiosInstance.post(`/chat/conversations/${conversationId}/read`);
    return res.data;
  },
};

export const adminApi = {
  getStats: async () => {
    const res = await axiosInstance.get('/admin/stats');
    return res.data;
  },
  listUsers: async (params: any = {}) => {
    const res = await axiosInstance.get('/admin/users', { params });
    return res.data;
  },
  blockUser: async (userId: string) => {
    const res = await axiosInstance.put(`/admin/users/${userId}/block`);
    return res.data;
  },
  unblockUser: async (userId: string) => {
    const res = await axiosInstance.put(`/admin/users/${userId}/unblock`);
    return res.data;
  },
  verifyUser: async (userId: string, status: 'verified' | 'rejected') => {
    const res = await axiosInstance.put(`/admin/users/${userId}/verify`, { status });
    return res.data;
  },
  deleteUser: async (userId: string) => {
    const res = await axiosInstance.delete(`/admin/users/${userId}`);
    return res.data;
  },
};

// ─── Personality API ──────────────────────────────────────────────────────────
export const personalityAPI = {
  getQuestions: async () => {
    const res = await axiosInstance.get('/personality/questions');
    return res.data;
  },

  submit: async (answers: { questionId: number; score: number }[]) => {
    const res = await axiosInstance.post('/personality/submit', { answers });
    return res.data;
  },

  getResult: async () => {
    const res = await axiosInstance.get('/personality/result');
    return res.data;
  },
};

// ─── Social API ───────────────────────────────────────────────────────────────
export const socialAPI = {
  getOAuthUrl: async (platform: string) => {
    const res = await axiosInstance.get(`/social/${platform}/oauth-url`);
    return res.data;
  },

  disconnect: async (platform: string) => {
    const res = await axiosInstance.post(`/social/disconnect/${platform}`);
    return res.data;
  },

  getInsights: async () => {
    const res = await axiosInstance.get('/social/insights');
    return res.data;
  },
};

// ─── Notification API ─────────────────────────────────────────────────────────
export const notificationAPI = {
  getAll: async () => {
    const res = await axiosInstance.get('/notifications');
    return res.data;
  },

  getUnreadCount: async () => {
    const res = await axiosInstance.get('/notifications/unread-count');
    return res.data;
  },

  markAllRead: async () => {
    const res = await axiosInstance.post('/notifications/read-all');
    return res.data;
  },
};

// ─── Verify API ───────────────────────────────────────────────────────────────
export const verifyAPI = {
  uploadSelfie: async (file: File) => {
    const form = new FormData();
    form.append('selfie', file);
    const res = await axiosInstance.post('/verify/upload-selfie', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  runVerification: async () => {
    const res = await axiosInstance.post('/verify/run-verification');
    return res.data;
  },

  getStatus: async () => {
    const res = await axiosInstance.get('/verify/status');
    return res.data;
  },
};

// ─── Named re-exports for backward compatibility ───────────────────────────────
// Old names used across pages — aliased so we don't need to touch every page
export const authApi = authAPI;
export const profileApi = profileAPI;
export const matchApi = matchAPI;
export const aiApi = aiAPI;
export const connectionApi = connectionAPI;
export const chatApi = chatAPI;
export const personalityApi = personalityAPI;
export const socialApi = socialAPI;
export const notificationApi = notificationAPI;
export const verifyApi = verifyAPI;

// Backward compat token helpers
export const setToken = saveToken;
export const clearToken = removeToken;
