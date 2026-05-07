import api, { generalApi } from './axios';

// Auth
export const login = (data: { email: string; password: string }) =>
  api.post('/login', data);

// Dashboard
export const getDashboardStats = () => api.get('/dashboard');

// Admin Management
export const createAdminUser = (data: { email: string; first_name: string; last_name: string; password: string }) =>
  api.post('/admins', data);
export const getAllAdmins = (params?: { page?: number; limit?: number }) =>
  api.get('/admins', { params });

// Users
export const getUsers = (params?: { page?: number; limit?: number; search?: string; status?: string; kyc_status?: string }) =>
  api.get('/users', { params });
export const getUser = (id: string) => api.get(`/users/${id}`);
export const updateUser = (id: string, data: any) => api.put(`/users/${id}`, data);
export const updateUserStatus = (id: string, status: string) =>
  api.put(`/users/${id}/status`, { status });
export const deleteUser = (id: string) => api.delete(`/users/${id}`);
export const generateApiKey = (id: string) => api.post(`/users/${id}/api-key`);
export const revokeApiKey = (id: string) => api.delete(`/users/${id}/api-key`);

// Admin Management
export const createAdmin = (data: any) => api.post('/admins', data);
export const getRoles = () => api.get('/roles');
export const creditUserWallet = (userId: string, amount: number, description: string) =>
  api.post('/wallet/credit', { userId, amount, description });

// Audit Logs
export const getAuditLogs = (params?: { page?: number; limit?: number }) =>
  api.get('/audit-logs', { params });
export const deleteAuditLog = (id: string) => api.delete(`/audit-logs/${id}`);

// Pricing Management
export const getPricingPlans = (params?: { page?: number; limit?: number; providerId?: number; type?: string; active?: boolean }) =>
  api.get('/pricing', { params });
export const getPricingPlanById = (id: string) => api.get(`/pricing/${id}`);
export const getPlansByProvider = (providerId: number, type?: string) =>
  api.get(`/pricing/provider/${providerId}`, { params: { type } });
export const createPricingPlan = (data: any) =>
  api.post('/pricing', data);
export const updatePricingPlan = (id: string, data: any) =>
  api.put(`/pricing/${id}`, data);
export const deletePricingPlan = (id: string) =>
  api.delete(`/pricing/${id}`);
export const bulkImportPricingPlans = (plans: any[]) =>
  api.post('/pricing/bulk-import', { plans });

// Developer Pricing Management
export const getAdminPlans = () => api.get('/plans');
export const updatePlanDeveloperPrice = (id: string, developer_price: number) =>
  api.put(`/plans/${id}/developer-price`, { developer_price });

// Providers (Bill payment API providers)
export const getProviders = (params?: { active?: boolean }) =>
  api.get('/providers', { params });
export const getProviderById = (id: string) => api.get(`/providers/${id}`);
export const createProvider = (data: any) => api.post('/providers', data);
export const updateProvider = (id: string, data: any) => api.put(`/providers/${id}`, data);
export const deleteProvider = (id: string) => api.delete(`/providers/${id}`);
export const getProviderEnv = (id: string) => api.get(`/providers/${id}/env`);
export const updateProviderEnv = (id: string, env: Record<string, string>) => api.put(`/providers/${id}/env`, { env });
export const testProviderConnection = (code: string) => api.post(`/providers/test/${code}`);
export const testProviderPurchase = (code: string, data: { service: string; payload: any }) =>
  api.post(`/providers/test-purchase/${code}`, data);
export const getProviderData = (code: string, type: 'balance' | 'networks' | 'plans') =>
  api.get(`/providers/data/${code}`, { params: { type } });

// Funding & Provider Balances
export const getProviderBalances = () => api.get('/providers/balances');
export const getFundingInfo = () => api.get('/funding/info');
export const getFundingAccounts = () => api.get('/funding/accounts');
export const createFundingAccount = (data: { bankName: string; accountName: string; accountNumber: string; instructions?: string; active?: boolean }) =>
  api.post('/funding/accounts', data);
export const updateFundingAccount = (id: string, data: Partial<{ bankName: string; accountName: string; accountNumber: string; instructions?: string; active?: boolean }>) =>
  api.put(`/funding/accounts/${id}`, data);
export const deleteFundingAccount = (id: string) => api.delete(`/funding/accounts/${id}`);

// Transactions
export const getTransactions = (params?: { page?: number; limit?: number; status?: string; type?: string; search?: string }) =>
  generalApi.get('/transactions/all', { params });
export const getTransactionById = (id: string) => generalApi.get(`/transactions/${id}`);

// Admin Profile
export const updateAdminProfile = (data: { first_name?: string; last_name?: string; email?: string }) =>
  api.put('/profile', data);
export const changeAdminPassword = (data: { currentPassword: string; newPassword: string }) =>
  api.put('/profile/password', data);

// Support Content
export const getSupportContent = () => api.get('/support-content');
export const updateSupportContent = (data: any) => api.put('/support-content', data);

// Notifications
export const sendBroadcast = (data: { title: string; message: string; type: string; action_link?: string }) =>
  api.post('/notifications/broadcast', data);
export const deleteBroadcast = (id: string) => api.delete(`/notifications/broadcast/${id}`);
export const getBroadcasts = () => api.get('/notifications/broadcast');
export const updateBroadcast = (id: string, data: { title: string; message: string; type: string; action_link?: string }) =>
  api.put(`/notifications/broadcast/${id}`, data);

// Email Notifications
export const sendEmail = (data: { subject: string; message: string; recipients: string[] }) =>
  api.post('/notifications/email', data);

// System Settings
export const getSystemSettings = () => api.get('/settings');
export const updateSystemSettings = (data: any) => api.put('/settings', data);

// Referral Management
export const getReferralStats = () => generalApi.get('/referrals/admin/stats');
export const getReferralSettings = () => generalApi.get('/referrals/settings');
export const updateReferralSettings = (data: any) => generalApi.put('/referrals/admin/settings', data);

// Airtime to Cash Management
export const getA2CRequests = () => api.get('/airtime-to-cash/requests');
export const updateA2CRequest = (id: string, data: { status: string; admin_note?: string }) =>
  api.put(`/airtime-to-cash/requests/${id}`, data);
export const getA2CSettings = () => api.get('/airtime-to-cash/settings');
export const createA2CSetting = (data: any) => api.post('/airtime-to-cash/settings', data);
export const updateA2CSetting = (id: string, data: any) => api.put(`/airtime-to-cash/settings/${id}`, data);
