// services/admin.service.ts
import api from './api';

export interface AdminUser {
  _id: string;
  email: string;
  first_name: string;
  last_name: string;
  role_id: string;
  status: 'active' | 'inactive';
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalTransactions: number;
  successfulTransactions: number;
  totalRevenue?: number;
  pendingTickets?: number;
}

export interface AuditLog {
  _id: string;
  admin_id: string;
  user_id?: string;
  action: string;
  entity_type: string;
  entity_id: string;
  old_value?: any;
  new_value?: any;
  ip_address?: string;
  timestamp: string;
}

export interface AdminLoginData {
  email: string;
  password: string;
}

export interface AdminAuthResponse {
  success: boolean;
  data: {
    admin: AdminUser;
    token: string;
  };
  message: string;
}

export const adminService = {
  /**
   * Admin login
   */
  login: async (data: AdminLoginData): Promise<AdminAuthResponse> => {
    try {
      const response = await api.post<AdminAuthResponse>('/admin/login', data);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Admin login failed' };
    }
  },

  /**
   * Get dashboard statistics
   */
  getDashboardStats: async (): Promise<{ success: boolean; data: DashboardStats; message: string }> => {
    try {
      const response = await api.get('/admin/dashboard');
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Failed to fetch dashboard stats' };
    }
  },

  /**
   * Get all users (admin only) with optional search by name or status
   */
  getAllUsers: async (
    page: number = 1,
    limit: number = 20,
    search?: string,
    status?: 'active' | 'inactive' | 'suspended'
  ): Promise<any> => {
    try {
      const response = await api.get('/admin/users', {
        params: { page, limit, search, status },
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Failed to fetch users' };
    }
  },

  /**
   * Search users by name (admin only)
   */
  searchUsersByName: async (
    name: string,
    page: number = 1,
    limit: number = 20
  ): Promise<any> => {
    try {
      const response = await api.get('/admin/users', {
        params: { page, limit, search: name },
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Failed to search users' };
    }
  },

  /**
   * Get user by ID (admin only)
   */
  getUserById: async (id: string): Promise<any> => {
    try {
      const response = await api.get(`/admin/users/${id}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Failed to fetch user' };
    }
  },

  /**
   * Update user status (admin only)
   */
  updateUserStatus: async (id: string, status: 'active' | 'inactive' | 'suspended'): Promise<any> => {
    try {
      const response = await api.put(`/admin/users/${id}/status`, { status });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Failed to update user status' };
    }
  },

  /**
   * Update user (admin only)
   */
  updateUser: async (id: string, data: any): Promise<any> => {
    try {
      const response = await api.put(`/admin/users/${id}`, data);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Failed to update user' };
    }
  },

  /**
   * Delete user (admin only)
   */
  deleteUser: async (id: string): Promise<any> => {
    try {
      const response = await api.delete(`/admin/users/${id}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Failed to delete user' };
    }
  },

  /**
   * Get audit logs (admin only)
   */
  getAuditLogs: async (page: number = 1, limit: number = 20): Promise<any> => {
    try {
      const response = await api.get('/admin/audit-logs', {
        params: { page, limit },
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Failed to fetch audit logs' };
    }
  },

  /**
   * Delete audit log (admin only)
   */
  deleteAuditLog: async (id: string): Promise<any> => {
    try {
      const response = await api.delete(`/admin/audit-logs/${id}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Failed to delete audit log' };
    }
  },

  /**
   * Send broadcast notification (admin only)
   */
  sendBroadcastNotification: async (data: { title: string; message: string; type: string; action_url?: string; priority?: string }): Promise<any> => {
    try {
      const response = await api.post('/admin/notifications/broadcast', data);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Failed to send broadcast notification' };
    }
  },
};
