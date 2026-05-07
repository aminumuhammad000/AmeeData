// services/monnify.service.ts
import axios, { AxiosInstance } from 'axios';
import crypto from 'crypto';

interface MonnifyConfig {
  apiKey: string;
  secretKey: string;
  contractCode: string;
  baseUrl: string;
}

interface InitiatePaymentData {
  amount: number;
  customerName: string;
  customerEmail: string;
  paymentReference: string;
  paymentDescription?: string;
  redirectUrl?: string;
  incomeSplitConfig?: any[];
}

interface MonnifyAuthResponse {
  requestSuccessful: boolean;
  responseMessage: string;
  responseBody: {
    accessToken: string;
    expiresIn: number;
  };
}

interface MonnifyPaymentResponse {
  requestSuccessful: boolean;
  responseMessage: string;
  responseBody: {
    transactionReference: string;
    paymentReference: string;
    merchantName: string;
    apiKey: string;
    enabledPaymentMethod: string[];
    checkoutUrl: string;
  };
}

interface MonnifyVerifyResponse {
  requestSuccessful: boolean;
  responseMessage: string;
  responseBody: {
    transactionReference: string;
    paymentReference: string;
    amountPaid: number;
    totalPayable: number;
    settlementAmount: number;
    paidOn: string;
    paymentStatus: 'PAID' | 'PENDING' | 'FAILED' | 'CANCELLED';
    paymentDescription: string;
    transactionHash: string;
    currency: string;
    paymentMethod: string;
    customer: {
      email: string;
      name: string;
    };
  };
}

export class MonnifyService {
  private config: MonnifyConfig;
  private axiosInstance: AxiosInstance;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor() {
    this.config = {
      apiKey: process.env.MONNIFY_API_KEY || '',
      secretKey: process.env.MONNIFY_SECRET_KEY || '',
      contractCode: process.env.MONNIFY_CONTRACT_CODE || '',
      baseUrl: process.env.MONNIFY_BASE_URL || 'https://sandbox.monnify.com',
    };

    this.axiosInstance = axios.create({
      baseURL: this.config.baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Get access token from Monnify
   */
  private async getAccessToken(): Promise<string> {
    try {
      // Return cached token if still valid
      if (this.accessToken && Date.now() < this.tokenExpiry) {
        return this.accessToken;
      }

      const auth = Buffer.from(
        `${this.config.apiKey}:${this.config.secretKey}`
      ).toString('base64');

      console.log('🔑 Requesting Monnify access token...');

      const response = await this.axiosInstance.post<MonnifyAuthResponse>(
        '/api/v1/auth/login',
        {},
        {
          headers: {
            Authorization: `Basic ${auth}`,
          },
        }
      );

      if (response.data.requestSuccessful) {
        this.accessToken = response.data.responseBody.accessToken;
        // Set expiry to 5 minutes before actual expiry
        this.tokenExpiry = Date.now() + (response.data.responseBody.expiresIn - 300) * 1000;
        console.log('✅ Monnify access token obtained');
        return this.accessToken;
      }

      throw new Error(response.data.responseMessage || 'Failed to get access token');
    } catch (error: any) {
      console.error('❌ Monnify auth error:', error.response?.data || error.message);
      throw new Error('Failed to authenticate with Monnify');
    }
  }

  /**
   * Initialize a payment transaction
   */
  async initiatePayment(data: InitiatePaymentData): Promise<MonnifyPaymentResponse['responseBody']> {
    try {
      const token = await this.getAccessToken();

      const payload = {
        amount: data.amount,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        paymentReference: data.paymentReference,
        paymentDescription: data.paymentDescription || 'Wallet Funding',
        currencyCode: 'NGN',
        contractCode: this.config.contractCode,
        redirectUrl: data.redirectUrl || process.env.FRONTEND_URL || 'http://localhost:8081',
        paymentMethods: ['CARD', 'ACCOUNT_TRANSFER', 'USSD'],
        incomeSplitConfig: data.incomeSplitConfig || [],
      };

      console.log('💳 Initiating Monnify payment:', payload.paymentReference);

      const response = await this.axiosInstance.post<MonnifyPaymentResponse>(
        '/api/v1/merchant/transactions/init-transaction',
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.requestSuccessful) {
        console.log('✅ Payment initialized:', response.data.responseBody.checkoutUrl);
        return response.data.responseBody;
      }

      throw new Error(response.data.responseMessage || 'Failed to initialize payment');
    } catch (error: any) {
      console.error('❌ Monnify initiate payment error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.responseMessage || 'Failed to initiate payment');
    }
  }

  /**
   * Verify a payment transaction
   */
  async verifyPayment(transactionReference: string): Promise<MonnifyVerifyResponse['responseBody']> {
    try {
      const token = await this.getAccessToken();

      console.log('🔍 Verifying Monnify payment:', transactionReference);

      const response = await this.axiosInstance.get<MonnifyVerifyResponse>(
        `/api/v2/transactions/${encodeURIComponent(transactionReference)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.requestSuccessful) {
        console.log('✅ Payment verified:', response.data.responseBody.paymentStatus);
        return response.data.responseBody;
      }

      throw new Error(response.data.responseMessage || 'Failed to verify payment');
    } catch (error: any) {
      console.error('❌ Monnify verify payment error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.responseMessage || 'Failed to verify payment');
    }
  }

  /**
   * Validate Monnify webhook signature
   */
  validateWebhookSignature(payload: any, signature: string): boolean {
    try {
      const hash = crypto
        .createHmac('sha512', this.config.secretKey)
        .update(JSON.stringify(payload))
        .digest('hex');

      return hash === signature;
    } catch (error) {
      console.error('❌ Webhook signature validation error:', error);
      return false;
    }
  }

  /**
   * Generate payment reference
   */
  generatePaymentReference(userId: string): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `MNF-${userId.substring(0, 8)}-${timestamp}-${random}`;
  }
}

export const monnifyService = new MonnifyService();
