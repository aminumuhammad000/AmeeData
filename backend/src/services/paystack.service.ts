import axios, { AxiosInstance, AxiosResponse } from 'axios';
import * as crypto from 'crypto';
import config from '../config/env.js';

interface PaystackTransactionResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    status: string;
    reference: string;
    amount: number;
    metadata: any;
  };
}

interface Bank {
  name: string;
  code: string;
  active: boolean;
  country: string;
  currency: string;
  type: string;
  id: number;
  createdAt: string;
  updatedAt: string;
}

interface BankListResponse {
  status: boolean;
  message: string;
  data: Bank[];
}

interface ResolveAccountResponse {
  status: boolean;
  message: string;
  data: {
    account_number: string;
    account_name: string;
  };
}

interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    status: string;
    reference: string;
    amount: number;
    metadata: any;
  };
}

export class PaystackService {
  private readonly api: AxiosInstance;
  private readonly baseUrl: string;
  private readonly secretKey: string;
  private readonly publicKey: string;
  private readonly webhookSecret: string;

  constructor() {
    this.baseUrl = 'https://api.paystack.co';
    this.secretKey = config.paystack.secretKey;
    this.publicKey = config.paystack.publicKey;
    this.webhookSecret = config.paystack.webhookSecret;

    if (!this.secretKey || !this.publicKey) {
      throw new Error('Paystack API keys are not configured');
    }

    this.api = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.secretKey}`,
      },
    });
  }

  /**
   * Initialize a transaction
   * @param email Customer's email
   * @param amount Amount in kobo (e.g., 5000 for ₦50.00)
   * @param reference Optional custom reference
   */
  async initializeTransaction(
    email: string,
    amount: number,
    reference?: string
  ): Promise<PaystackTransactionResponse> {
    try {
      const response: AxiosResponse<PaystackTransactionResponse> = await this.api.post('/transaction/initialize', {
        email,
        amount: amount * 100, // Convert to kobo
        reference: reference || `VTU_${Date.now()}`,
        callback_url: `${config.appUrl}/api/payment/verify`,
        metadata: {
          custom_fields: [
            {
              display_name: 'Payment For',
              variable_name: 'payment_for',
              value: 'VTU Wallet Topup'
            }
          ]
        }
      });

      return response.data;
    } catch (error: any) {
      console.error('Paystack initialization error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to initialize Paystack payment');
    }
  }

  /**
   * Verify a transaction
   * @param reference Transaction reference to verify
   */
  async verifyTransaction(reference: string): Promise<PaystackVerifyResponse> {
    try {
      const response = await this.api.get(`/transaction/verify/${reference}`);
      return response.data;
    } catch (error: any) {
      console.error('Paystack verification error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to verify Paystack payment');
    }
  }

  /**
   * Handle Paystack webhook
   * @param payload Webhook payload
   * @param signature Webhook signature for verification
   */
  async handleWebhook(payload: any, signature: string): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      // Verify the webhook signature
      if (!this.secretKey) {
        throw new Error('Paystack secret key is not configured');
      }
      
      const hmac = crypto.createHmac('sha512', this.secretKey);
      hmac.update(JSON.stringify(payload));
      const hash = hmac.digest('hex');

      if (hash !== signature) {
        throw new Error('Invalid webhook signature');
      }

      const { event, data } = payload;
      
      if (event === 'charge.success') {
        return {
          success: true,
          data: {
            reference: data.reference,
            amount: data.amount / 100, // Convert back to naira
            status: data.status,
            paidAt: data.paid_at,
            metadata: data.metadata
          }
        };
      }

      return { success: false, message: 'Unhandled event type' };
    } catch (error: any) {
      console.error('Paystack webhook error:', error);
      throw error;
    }
  }

  /**
   * Create a transfer recipient
   * @param accountNumber Bank account number
   * @param bankCode Paystack bank code
   * @param accountName Account name (optional)
   */
  async createTransferRecipient(accountNumber: string, bankCode: string, accountName?: string) {
    try {
      const response = await this.api.post('/transferrecipient', {
        type: 'nuban',
        name: accountName || 'VTU Customer',
        account_number: accountNumber,
        bank_code: bankCode,
        currency: 'NGN'
      });

      return response.data;
    } catch (error: any) {
      console.error('Paystack create recipient error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to create transfer recipient');
    }
  }

  /**
   * Initiate a transfer
   * @param amount Amount in kobo
   * @param recipient Recipient code from createTransferRecipient
   * @param reason Optional reason for transfer
   */
  async initiateTransfer(amount: number, recipient: string, reason?: string) {
    try {
      const response = await this.api.post('/transfer', {
        source: 'balance',
        amount: amount * 100, // Convert to kobo
        recipient,
        reason: reason || 'VTU Wallet Withdrawal'
      });

      return response.data;
    } catch (error: any) {
      console.error('Paystack transfer error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to initiate transfer');
    }
  }

  /**
   * Verify a transfer
   * @param reference Transfer reference
   */
  async verifyTransfer(reference: string) {
    try {
      const response = await this.api.get(`/transfer/verify/${reference}`);
      return response.data;
    } catch (error: any) {
      console.error('Paystack transfer verification error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to verify transfer');
    }
  }

  /**
   * List all banks
   */
  async listBanks() {
    try {
      const response = await this.api.get('/bank?country=nigeria');
      return response.data;
    } catch (error: any) {
      console.error('Paystack list banks error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to fetch banks');
    }
  }

  /**
   * Resolve account number
   * @param accountNumber Bank account number
   * @param bankCode Paystack bank code
   */
  async resolveAccount(accountNumber: string, bankCode: string) {
    try {
      const response = await this.api.get(`/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`);
      return response.data;
    } catch (error: any) {
      console.error('Paystack resolve account error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to resolve account details');
    }
  }
}
