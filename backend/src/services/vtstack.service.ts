import axios, { AxiosInstance } from 'axios';

interface VTStackConfig {
    apiKey: string;
    baseUrl: string;
}

interface CreateVirtualAccountData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    bvn: string;
    identityType: 'INDIVIDUAL' | 'BUSINESS';
    reference: string;
}

interface VirtualAccountClientResponse {
    id: string;
    accountNumber: string;
    accountName: string;
    alias: string;
    reference: string;
    bankName: string;
    status: string;
}

interface VirtualAccountBalanceResponse {
    balanceAmount: number;
    availableBalance: number;
    currency: string;
}

export class VTStackService {
    private config: VTStackConfig;
    private axiosInstance: AxiosInstance;

    constructor() {
        this.config = {
            apiKey: process.env.VTSTACK_API_KEY || 'sk_test_e23b5f55e47ad8e8a7ca30c7ddadbf6539b44fefab6ac6d9',
            baseUrl: process.env.VTSTACK_BASE_URL || 'https://api.vtstack.com.ng/api',
        };

        if (!process.env.VTSTACK_API_KEY && !this.config.apiKey) {
            console.warn('⚠️ VTSTACK_API_KEY is not set in environment variables');
        }

        this.axiosInstance = axios.create({
            baseURL: this.config.baseUrl,
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': this.config.apiKey,
            },
        });
    }

    /**
     * Generate a new dedicated virtual account for a customer
     */
    async createVirtualAccount(data: CreateVirtualAccountData): Promise<VirtualAccountClientResponse> {
        try {
            console.log('🏦 Creating VTStack virtual account:', data.reference);

            const response = await this.axiosInstance.post<{
                success: boolean;
                message: string;
                data: VirtualAccountClientResponse;
            }>('/virtual-accounts', data);

            if (response.data.success) {
                console.log('✅ Virtual account created:', response.data.data.accountNumber);
                return response.data.data;
            }

            throw new Error(response.data.message || 'Failed to create virtual account');
        } catch (error: any) {
            console.error('❌ VTStack create account error:', error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Failed to create virtual account');
        }
    }

    /**
     * Retrieve a list of all virtual accounts created under your API key
     */
    async getVirtualAccounts(): Promise<VirtualAccountClientResponse[]> {
        try {
            const response = await this.axiosInstance.get<{
                success: boolean;
                data: VirtualAccountClientResponse[];
            }>('/virtual-accounts');

            if (response.data.success) {
                return response.data.data;
            }

            throw new Error('Failed to fetch virtual accounts');
        } catch (error: any) {
            console.error('❌ VTStack fetch accounts error:', error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Failed to fetch virtual accounts');
        }
    }

    /**
     * Fetch the current balance of a specific virtual account
     */
    async getAccountBalance(accountNumber: string): Promise<VirtualAccountBalanceResponse> {
        try {
            const response = await this.axiosInstance.get<{
                success: boolean;
                data: VirtualAccountBalanceResponse;
            }>(`/virtual-accounts/${accountNumber}/balance`);

            if (response.data.success) {
                return response.data.data;
            }

            throw new Error('Failed to fetch account balance');
        } catch (error: any) {
            console.error('❌ VTStack fetch balance error:', error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Failed to fetch account balance');
        }
    }

    /**
     * Generate a unique reference for the virtual account
     */
    generateReference(userId: string): string {
        const timestamp = Date.now();
        return `VTS-${userId.substring(0, 8)}-${timestamp}`;
    }
}

export const vtStackService = new VTStackService();
