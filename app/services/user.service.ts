import api from './api';

export interface UserUpdateData {
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  date_of_birth?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
}

export const userService = {
  /**
   * Get user profile
   */
  getProfile: async (): Promise<any> => {
    try {
      const response = await api.get('/users/profile');
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Failed to fetch profile' };
    }
  },

  /**
   * Set user's 4-digit transaction PIN
   */
  setTransactionPin: async (pin: string): Promise<any> => {
    try {
      const response = await api.post('/users/transaction-pin', { pin });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Failed to set transaction PIN' };
    }
  },

  /**
   * Update user's 4-digit transaction PIN
   */
  updateTransactionPin: async (current_pin: string, new_pin: string): Promise<any> => {
    try {
      const response = await api.put('/users/transaction-pin', { current_pin, new_pin });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Failed to update transaction PIN' };
    }
  },

  /**
   * Update user profile
   */
  updateProfile: async (data: UserUpdateData): Promise<any> => {
    try {
      const response = await api.put('/users/profile', data);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Profile update failed' };
    }
  },

  /**
   * Update password
   */
  updatePassword: async (currentPassword: string, newPassword: string): Promise<any> => {
    try {
      const response = await api.put('/users/password', {
        current_password: currentPassword,
        new_password: newPassword,
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Password update failed' };
    }
  },

  /**
   * Upload KYC documents
   */
  uploadKYC: async (data: { document_type: string; document_number: string; document_image?: string }): Promise<any> => {
    try {
      const response = await api.post('/users/kyc', data);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'KYC upload failed' };
    }
  },

  /**
   * Delete user profile
   */
  deleteProfile: async (): Promise<any> => {
    try {
      const response = await api.delete('/users/profile');
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Profile deletion failed' };
    }
  },

  /**
   * Get user by ID (admin endpoint)
   */
  getUserById: async (id: string): Promise<any> => {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Failed to fetch user' };
    }
  },

  /**
   * Get all users (admin endpoint)
   */
  getAllUsers: async (page: number = 1, limit: number = 20): Promise<any> => {
    try {
      const response = await api.get('/users', {
        params: { page, limit },
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Failed to fetch users' };
    }
  },
};
