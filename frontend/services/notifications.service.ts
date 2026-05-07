// services/notifications.service.ts
import api from './api';

export interface Notification {
  _id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'transaction' | 'promotion' | 'system' | 'alert';
  priority: 'low' | 'medium' | 'high';
  is_read: boolean;
  action_url?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface NotificationResponse {
  success: boolean;
  data: Notification[];
  message: string;
}

export interface SingleNotificationResponse {
  success: boolean;
  data: Notification;
  message: string;
}

export const notificationsService = {
  /**
   * Get all notifications for current user
   */
  getNotifications: async (page: number = 1, limit: number = 20): Promise<NotificationResponse> => {
    try {
      const response = await api.get<NotificationResponse>('/notifications', {
        params: { page, limit },
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Failed to fetch notifications' };
    }
  },

  /**
   * Get notification by ID
   */
  getNotificationById: async (id: string): Promise<SingleNotificationResponse> => {
    try {
      const response = await api.get<SingleNotificationResponse>(`/notifications/${id}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Failed to fetch notification' };
    }
  },

  /**
   * Mark notification as read
   */
  markAsRead: async (id: string): Promise<any> => {
    try {
      const response = await api.put(`/notifications/${id}/read`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Failed to mark notification as read' };
    }
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (): Promise<any> => {
    try {
      const response = await api.put('/notifications/read-all');
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Failed to mark all as read' };
    }
  },

  /**
   * Delete notification
   */
  deleteNotification: async (id: string): Promise<any> => {
    try {
      const response = await api.delete(`/notifications/${id}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Failed to delete notification' };
    }
  },

  /**
   * Delete all notifications
   */
  deleteAllNotifications: async (): Promise<any> => {
    try {
      const response = await api.delete('/notifications');
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Failed to delete all notifications' };
    }
  },

  /**
   * Get unread notification count
   */
  getUnreadCount: async (): Promise<{ count: number }> => {
    try {
      const response = await api.get<NotificationResponse>('/notifications', {
        params: { unread: true },
      });
      return { count: response.data.data?.length || 0 };
    } catch (error: any) {
      return { count: 0 };
    }
  },
};
