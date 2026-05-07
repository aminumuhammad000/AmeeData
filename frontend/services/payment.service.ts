// services/payment.service.ts
import api from './api';

export interface PaymentInitiateData {
  amount: number;
  gateway?: 'payrant' | 'monnify' | 'apystack'; // Supported payment gateways
}

export interface PaymentInitiateResponse {
  success: boolean;
  data: {
    transaction: {
      id: string;
      reference: string;
      amount: number;
      status: string;
    };
    payment: {
      gateway?: string;
      checkoutUrl?: string;
      transactionReference?: string;
      paymentReference?: string;
      reference?: string;
      accountNumber?: string;
      bankName?: string;
    };
  };
  message: string;
}

export interface PaymentVerifyResponse {
  success: boolean;
  data: {
    status: 'paid' | 'pending' | 'failed';
    transaction: any;
    amountPaid?: number;
  };
  message: string;
}

export interface PaymentHistoryResponse {
  success: boolean;
  data: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  message: string;
}

export const paymentService = {
  /**
   * Initialize payment for wallet funding
   */
  initiatePayment: async (data: PaymentInitiateData): Promise<PaymentInitiateResponse> => {
    try {
      console.log('💳 Initiating payment:', data);
      const response = await api.post<PaymentInitiateResponse>('/payment/initiate', data);
      console.log('✅ Payment initiated:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Payment initiation error:', error.response?.data || error.message);
      throw error.response?.data || { success: false, message: 'Failed to initiate payment' };
    }
  },

  /**
   * Verify payment status
   */
  verifyPayment: async (reference: string): Promise<PaymentVerifyResponse> => {
    try {
      console.log('🔍 Verifying payment:', reference);
      const response = await api.get<PaymentVerifyResponse>(`/payment/verify/${reference}`);
      console.log('✅ Payment verified:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Payment verification error:', error.response?.data || error.message);
      throw error.response?.data || { success: false, message: 'Failed to verify payment' };
    }
  },

  /**
   * Get payment history
   */
  getPaymentHistory: async (page: number = 1, limit: number = 20): Promise<PaymentHistoryResponse> => {
    try {
      const response = await api.get<PaymentHistoryResponse>(`/payment/history?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Get payment history error:', error.response?.data || error.message);
      throw error.response?.data || { success: false, message: 'Failed to get payment history' };
    }
  },
};
