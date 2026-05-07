// services/support.service.ts
import api from './api';

export interface SupportTicket {
  _id: string;
  user_id: string;
  subject: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  category?: string;
  attachment_url?: string;
  admin_response?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTicketData {
  subject: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category?: string;
}

export interface TicketResponse {
  success: boolean;
  data: SupportTicket[];
  message: string;
}

export interface SingleTicketResponse {
  success: boolean;
  data: SupportTicket;
  message: string;
}

export interface SupportContent {
  email: string;
  phoneNumber: string;
  whatsappNumber: string;
  facebookUrl?: string;
  twitterUrl?: string;
  instagramUrl?: string;
  websiteUrl?: string;
}

export interface SupportContentResponse {
  success: boolean;
  data: SupportContent;
  message: string;
}

export const supportService = {
  /**
   * Create a new support ticket
   */
  createTicket: async (data: CreateTicketData): Promise<SingleTicketResponse> => {
    try {
      console.log('🎫 Creating support ticket:', data);
      const response = await api.post<SingleTicketResponse>('/support', data);
      console.log('✅ Ticket created:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Create ticket error:', error.response?.data || error.message);
      throw error.response?.data || { success: false, message: 'Failed to create support ticket' };
    }
  },

  /**
   * Get all tickets for current user
   */
  getTickets: async (page: number = 1, limit: number = 20): Promise<TicketResponse> => {
    try {
      const response = await api.get<TicketResponse>('/support', {
        params: { page, limit },
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Failed to fetch tickets' };
    }
  },

  /**
   * Get ticket by ID
   */
  getTicketById: async (id: string): Promise<SingleTicketResponse> => {
    try {
      const response = await api.get<SingleTicketResponse>(`/support/${id}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Failed to fetch ticket' };
    }
  },

  /**
   * Update ticket
   */
  updateTicket: async (id: string, data: Partial<CreateTicketData>): Promise<SingleTicketResponse> => {
    try {
      const response = await api.put<SingleTicketResponse>(`/support/${id}`, data);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Failed to update ticket' };
    }
  },

  /**
   * Close ticket
   */
  closeTicket: async (id: string): Promise<any> => {
    try {
      const response = await api.put(`/support/${id}/status`, { status: 'closed' });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Failed to close ticket' };
    }
  },

  /**
   * Delete ticket
   */
  deleteTicket: async (id: string): Promise<any> => {
    try {
      const response = await api.delete(`/support/${id}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Failed to delete ticket' };
    }
  },

  /**
   * Get support contact content
   */
  getSupportContent: async (): Promise<SupportContentResponse> => {
    try {
      const response = await api.get<SupportContentResponse>('/support-content');
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Failed to fetch support content' };
    }
  },
};
