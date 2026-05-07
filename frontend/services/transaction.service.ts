import api from './api';

export interface Transaction {
  _id: string;
  user_id: string;
  wallet_id: string;
  type: 'airtime_topup' | 'data_purchase' | 'bill_payment' | 'wallet_topup' | 'e-pin_purchase';
  amount: number;
  fee: number;
  total_charged: number;
  status: 'pending' | 'successful' | 'failed' | 'refunded';
  reference_number: string;
  description?: string;
  payment_method: string;
  destination_account?: string;
  operator_id?: string;
  plan_id?: string;
  receipt_url?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface TransactionResponse {
  success: boolean;
  data: {
    transactions: Transaction[];
    total: number;
    page: number;
    limit: number;
  };
  message: string;
}

export interface AirtimePurchaseData {
  phone_number: string;
  amount: number;
  operator_id: string;
}

export interface DataPurchaseData {
  phone_number: string;
  plan_id: string;
  operator_id: string;
}

export const transactionService = {
  /**
   * Get user transactions with pagination
   */
  getTransactions: async (page: number = 1, limit: number = 10): Promise<TransactionResponse> => {
    try {
      const response = await api.get<TransactionResponse>('/transactions', {
        params: { page, limit },
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Failed to fetch transactions' };
    }
  },

  /**
   * Get transaction by ID
   */
  getTransactionById: async (id: string): Promise<any> => {
    try {
      const response = await api.get(`/transactions/${id}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Failed to fetch transaction' };
    }
  },

  /**
   * Purchase airtime
   */
  purchaseAirtime: async (data: AirtimePurchaseData): Promise<any> => {
    try {
      const response = await api.post('/billpayment/airtime', data);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Airtime purchase failed' };
    }
  },

  /**
   * Purchase data
   */
  purchaseData: async (data: DataPurchaseData): Promise<any> => {
    try {
      const response = await api.post('/billpayment/data', data);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Data purchase failed' };
    }
  },
};
