import api from './api';

export interface VirtualAccount {
    id: string;
    accountNumber: string;
    accountName: string;
    bankName: string;
    bankType: string;
    reference: string;
    status: string;
    created_at?: string;
}

export interface Transaction {
    reference: string;
    amount: number;
    type: 'credit' | 'debit';
    description: string;
    date: string;
    status: string;
}

export const vtstackService = {
    /**
     * Get all virtual accounts for the user
     */
    getMyAccounts: async (): Promise<{ success: boolean; data: VirtualAccount[] }> => {
        try {
            const response = await api.get('/payment/vtstack/virtual-account');
            return response.data;
        } catch (error: any) {
            throw error.response?.data || error;
        }
    },

    /**
     * Create a new virtual account
     */
    createAccount: async (bvn: string): Promise<{ success: boolean; data: VirtualAccount }> => {
        try {
            const response = await api.post('/payment/vtstack/create-virtual-account', { bvn });
            return response.data;
        } catch (error: any) {
            throw error.response?.data || error;
        }
    }
};
