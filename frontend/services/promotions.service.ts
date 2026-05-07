// services/promotions.service.ts
import api from './api';

export interface Promotion {
  _id: string;
  title: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_purchase_amount?: number;
  max_discount_amount?: number;
  code?: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  target_services?: string[];
  usage_limit?: number;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export interface PromotionResponse {
  success: boolean;
  data: Promotion[];
  message: string;
}

export interface SinglePromotionResponse {
  success: boolean;
  data: Promotion;
  message: string;
}

export const promotionsService = {
  /**
   * Get all active promotions
   */
  getActivePromotions: async (): Promise<PromotionResponse> => {
    try {
      const response = await api.get<PromotionResponse>('/promotions');
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Failed to fetch promotions' };
    }
  },

  /**
   * Get promotion by ID
   */
  getPromotionById: async (id: string): Promise<SinglePromotionResponse> => {
    try {
      const response = await api.get<SinglePromotionResponse>(`/promotions/${id}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Failed to fetch promotion' };
    }
  },

  /**
   * Validate promotion code
   */
  validatePromoCode: async (code: string, amount: number): Promise<any> => {
    try {
      const response = await api.post('/promotions/validate', { code, amount });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Invalid promo code' };
    }
  },

  /**
   * Apply promotion to transaction
   */
  applyPromotion: async (promoId: string, transactionId: string): Promise<any> => {
    try {
      const response = await api.post('/promotions/apply', {
        promotion_id: promoId,
        transaction_id: transactionId,
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Failed to apply promotion' };
    }
  },
};
