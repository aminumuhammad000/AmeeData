import api from './api';

export interface AirtimeToCashRequest {
    network: string;
    phone_number: string;
    amount: number;
}

export const airtimeToCashService = {
    submitRequest: async (data: AirtimeToCashRequest) => {
        try {
            const response = await api.post('/airtime-to-cash/submit', data);
            return response.data;
        } catch (error: any) {
            throw error.response?.data || error.message;
        }
    },

    getMyRequests: async () => {
        try {
            const response = await api.get('/airtime-to-cash/history');
            return response.data;
        } catch (error: any) {
            throw error.response?.data || error.message;
        }
    },

    getSettings: async () => {
        try {
            const response = await api.get('/airtime-to-cash/settings');
            return response.data;
        } catch (error: any) {
            throw error.response?.data || error.message;
        }
    }
};
