import api from './api';

export interface Network {
  network_id: string;
  name: string;
  network_code: string;
  description?: string;
}

export interface DataPlan {
  plan_id: string;
  network: string;
  plan_name: string;
  plan_type: string;
  validity: string;
  price: number;
  data_value: string;
}

export interface AirtimePurchaseData {
  network: string;
  phone: string;
  amount: number;
  airtime_type?: 'VTU' | 'SHARE_AND_SELL';
  ported_number?: boolean;
  pin?: string; // 4-digit transaction pin
}

export interface DataPurchaseData {
  network: string;
  phone: string;
  plan: string;
  ported_number?: boolean;
  pin?: string; // 4-digit transaction pin
}

export interface BillPaymentResponse {
  success: boolean;
  message: string;
  data?: any;
}

export const billPaymentService = {
  /**
   * Get available networks
   */
  getNetworks: async (): Promise<BillPaymentResponse> => {
    try {
      const response = await api.get<BillPaymentResponse>('/billpayment/networks');
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Failed to fetch networks' };
    }
  },

  /**
   * Get available electricity providers
   */
  getElectricityProviders: async (): Promise<BillPaymentResponse> => {
    try {
      const response = await api.get<BillPaymentResponse>('/billpayment/electricity-providers');
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Failed to fetch electricity providers' };
    }
  },

  /**
   * Get data plans
   */
  getDataPlans: async (network?: string): Promise<BillPaymentResponse> => {
    try {
      const response = await api.get<BillPaymentResponse>('/billpayment/data-plans', {
        params: { network },
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Failed to fetch data plans' };
    }
  },

  /**
   * Purchase airtime
   */
  purchaseAirtime: async (data: AirtimePurchaseData): Promise<BillPaymentResponse> => {
    try {
      console.log('📱 Purchasing airtime:', data);
      const response = await api.post<BillPaymentResponse>('/billpayment/airtime', data);
      console.log('✅ Airtime purchase response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Airtime purchase error:', error.response?.data || error.message);
      throw error.response?.data || { success: false, message: 'Failed to purchase airtime' };
    }
  },

  /**
   * Purchase data
   */
  purchaseData: async (data: DataPurchaseData): Promise<BillPaymentResponse> => {
    try {
      console.log('📶 Purchasing data:', data);
      const response = await api.post<BillPaymentResponse>('/billpayment/data', data);
      console.log('✅ Data purchase response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Data purchase error:', error.response?.data || error.message);
      throw error.response?.data || { success: false, message: 'Failed to purchase data' };
    }
  },

  /**
   * Verify cable account
   */
  verifyCableAccount: async (provider: string, iucnumber: string): Promise<BillPaymentResponse> => {
    try {
      const response = await api.post<BillPaymentResponse>('/billpayment/cable/verify', {
        provider,
        iucnumber,
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Failed to verify cable account' };
    }
  },

  /**
   * Purchase cable TV
   */
  purchaseCableTV: async (data: any): Promise<BillPaymentResponse> => {
    try {
      const response = await api.post<BillPaymentResponse>('/billpayment/cable/purchase', data);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Failed to purchase cable TV' };
    }
  },

  /**
   * Verify electricity meter
   */
  verifyElectricityMeter: async (provider: string, meternumber: string, metertype: string): Promise<BillPaymentResponse> => {
    try {
      const response = await api.post<BillPaymentResponse>('/billpayment/electricity/verify', {
        provider,
        meternumber,
        metertype,
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Failed to verify meter' };
    }
  },

  /**
   * Purchase electricity
   */
  purchaseElectricity: async (data: any): Promise<BillPaymentResponse> => {
    try {
      const response = await api.post<BillPaymentResponse>('/billpayment/electricity/purchase', data);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Failed to purchase electricity' };
    }
  },

  /**
   * Purchase exam pin
   */
  purchaseExamPin: async (data: { provider: string; quantity: string; pin?: string }): Promise<BillPaymentResponse> => {
    try {
      const response = await api.post<BillPaymentResponse>('/billpayment/exampin', data);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Failed to purchase exam pin' };
    }
  },

  /**
   * Get transaction status
   */
  getTransactionStatus: async (reference: string): Promise<BillPaymentResponse> => {
    try {
      const response = await api.get<BillPaymentResponse>(`/billpayment/transaction/${reference}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Failed to get transaction status' };
    }
  },
};
