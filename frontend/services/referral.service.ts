import api from './api';

export interface ReferralStats {
    referral_code: string;
    referral_count: number;
    total_earnings: number;
    referrals: Array<{
        first_name: string;
        last_name: string;
        created_at: string;
        status: string;
    }>;
}

export interface ReferralSetting {
    referrer_bonus_amount: number;
    referee_bonus_amount: number;
    min_transaction_for_bonus: number;
    is_active: boolean;
}

export const referralService = {
    getStats: async (): Promise<{ success: boolean; data: ReferralStats }> => {
        try {
            const response = await api.get('/referrals/stats');
            return response.data;
        } catch (error: any) {
            throw error.response?.data || error.message;
        }
    },

    getSettings: async (): Promise<{ success: boolean; data: ReferralSetting }> => {
        try {
            const response = await api.get('/referrals/settings');
            return response.data;
        } catch (error: any) {
            throw error.response?.data || error.message;
        }
    }
};
