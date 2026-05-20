import api from './api';

export interface CareCircleMember {
  _id: string;
  user_id: string;
  member_id: {
    _id: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    profile_picture?: string;
  };
  nickname?: string;
  relationship_label?: string;
  quick_amounts?: number[];
  is_pinned: boolean;
  order: number;
  notes?: string;
  created_at: string;
}

export const careService = {
  getCircle: async (): Promise<any> => {
    try {
      const response = await api.get('/care/circle');
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Failed to fetch Care Circle' };
    }
  },

  addMember: async (data: { phone_number?: string; member_id?: string; nickname?: string; relationship_label?: string }): Promise<any> => {
    try {
      const response = await api.post('/care/circle', data);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Failed to add member' };
    }
  },

  updateMember: async (id: string, updates: Partial<CareCircleMember>): Promise<any> => {
    try {
      const response = await api.patch(`/care/circle/${id}`, updates);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Failed to update member' };
    }
  },

  removeMember: async (id: string): Promise<any> => {
    try {
      const response = await api.delete(`/care/circle/${id}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Failed to remove member' };
    }
  },

  getStats: async (memberId: string): Promise<any> => {
    try {
      const response = await api.get(`/care/stats/${memberId}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Failed to fetch stats' };
    }
  },

  requestCare: async (data: { provider_id: string; amount: number; purpose: string; message?: string }): Promise<any> => {
    try {
      const response = await api.post('/care/request', data);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Failed to send request' };
    }
  },

  getRequests: async (type?: 'sent' | 'received'): Promise<any> => {
    try {
      const response = await api.get('/care/requests', { params: { type } });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Failed to fetch requests' };
    }
    }
  },

  getPurposes: async (): Promise<any> => {
    try {
      const response = await api.get('/care/purposes');
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Failed to fetch care purposes' };
    }
  }
};
