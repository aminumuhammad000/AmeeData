import axios, { AxiosInstance } from 'axios';
import ProviderConfig from '../models/provider.model.js';
import logger from '../utils/logger.js';

interface SMEPlugDataPurchase {
  network_id: number;
  plan_id: number;
  phone: string;
  customer_reference?: string;
}

interface SMEPlugAirtimePurchase {
  network_id: number;
  amount: number;
  phone: string;
  customer_reference?: string;
}

class SMEPlugService {
  private api: AxiosInstance | null = null;

  private getNetworkId(network: string | number): number {
    const net = String(network).toLowerCase();

    // Map App IDs (from normalizeNetwork) to SME Plug IDs
    // App: 1=MTN, 2=Airtel, 3=Glo, 4=9mobile
    // SME: 1=MTN, 2=Airtel, 3=9mobile, 4=Glo
    if (net === '1') return 1; // MTN
    if (net === '2') return 2; // Airtel
    if (net === '3') return 4; // Glo (App 3 -> SME 4)
    if (net === '4') return 3; // 9mobile (App 4 -> SME 3)

    const map: Record<string, number> = {
      'mtn': 1,
      'airtel': 2,
      '9mobile': 3,
      'etisalat': 3,
      'glo': 4,
      'globacom': 4
    };
    const id = map[net];
    if (!id) throw new Error(`Unsupported network: ${network}`);
    return id;
  }

  private maskKey(key: string): string {
    if (!key) return 'empty';
    if (key.length <= 10) return '***';
    return `${key.substring(0, 5)}...${key.substring(key.length - 5)}`;
  }

  private async ensureClient() {
    if (this.api) return this.api;
    const cfg = await ProviderConfig.findOne({ code: 'smeplug' });
    const baseURL = cfg?.base_url || 'https://smeplug.ng/api';
    
    // Priority: process.env > database api_key > database metadata
    const apiKey = process.env.SMEPLUG_API_KEY || 
                   cfg?.api_key || 
                   (cfg?.metadata as any)?.env?.SMEPLUG_API_KEY || 
                   '';

    if (!apiKey) {
      logger.error('SMEPlug API key not configured in .env or database');
      throw new Error('SMEPlug API key not configured');
    }

    logger.info(`Initializing SMEPlug client with key: ${this.maskKey(apiKey)} and baseURL: ${baseURL}`);

    this.api = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      timeout: 30000,
    });

    return this.api;
  }

  /**
   * Get wallet balance
   * GET /v1/account/balance
   */
  async getWalletBalance() {
    let api;
    try {
      api = await this.ensureClient();
      const res = await api.get('/v1/account/balance');
      logger.info('SMEPlug wallet balance retrieved', { balance: res.data });
      return res.data;
    } catch (error: any) {
      logger.error('SMEPlug getWalletBalance error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  }

  /**
   * Get available networks
   * GET /v1/networks
   */
  async getNetworks() {
    let api;
    try {
      api = await this.ensureClient();
      const res = await api.get('/v1/networks');
      logger.info('SMEPlug networks retrieved', { count: res.data?.data?.length || 0 });
      return res.data;
    } catch (error: any) {
      logger.error('SMEPlug getNetworks error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  }

  /**
   * Get data plans
   * GET /v1/data/plans
   */
  async getDataPlans() {
    try {
      const api = await this.ensureClient();
      const res = await api.get('/v1/data/plans');
      logger.info('SMEPlug data plans retrieved', { count: res.data?.data?.length || 0 });
      return res.data;
    } catch (error: any) {
      logger.error('SMEPlug getDataPlans error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Purchase airtime
   * POST /v1/airtime/purchase
   */
  async purchaseAirtime(data: any) {
    try {
      const api = await this.ensureClient();

      // Map controller payload to SMEPlug payload
      const payload: SMEPlugAirtimePurchase = {
        network_id: this.getNetworkId(data.network),
        amount: Number(data.amount),
        phone: data.phone,
        customer_reference: data.ref
      };

      const res = await api.post('/v1/airtime/purchase', payload);
      logger.info('SMEPlug airtime purchased', {
        phone: payload.phone,
        amount: payload.amount,
        reference: res.data?.data?.reference
      });
      return res.data;
    } catch (error: any) {
      logger.error('SMEPlug purchaseAirtime error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  }

  /**
   * Purchase data plan
   * POST /v1/data/purchase
   * Payload: { network_id, plan_id, phone, customer_reference }
   */
  async purchaseData(data: any) {
    try {
      const api = await this.ensureClient();

      // Map controller payload to SMEPlug payload
      const payload: SMEPlugDataPurchase = {
        network_id: this.getNetworkId(data.network),
        plan_id: Number(data.plan), // Controller sends plan ID
        phone: data.phone,
        customer_reference: data.ref
      };

      const res = await api.post('/v1/data/purchase', payload);
      logger.info('SMEPlug data purchased', {
        phone: payload.phone,
        plan_id: payload.plan_id,
        reference: res.data?.data?.reference
      });
      return res.data;
    } catch (error: any) {
      logger.error('SMEPlug purchaseData error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  }

  /**
   * Get transaction status
   * GET /v1/transactions/:reference
   */
  async getTransactionStatus(reference: string) {
    try {
      const api = await this.ensureClient();
      const res = await api.get(`/v1/transactions/${encodeURIComponent(reference)}`);
      logger.info('SMEPlug transaction status retrieved', { reference, status: res.data?.data?.status });
      return res.data;
    } catch (error: any) {
      logger.error('SMEPlug getTransactionStatus error:', error.response?.data || error.message);
      throw error;
    }
  }
}

export default new SMEPlugService();
