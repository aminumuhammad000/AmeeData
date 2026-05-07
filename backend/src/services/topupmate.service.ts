// services/topupmate.service.ts
import axios, { AxiosInstance } from 'axios';
import { logger } from '../config/bootstrap.js';
import ProviderConfig from '../models/provider.model.js';

interface TopupmateResponse {
  status: string;
  msg?: string;
  response?: any;
  [key: string]: any;
}

class TopupmateService {
  private api: AxiosInstance | null = null;
  private baseURL: string = 'https://connect.topupmate.com/api';

  private async ensureClient() {
    // Always fetch fresh config to handle admin updates immediately
    const cfg = await ProviderConfig.findOne({ code: 'topupmate' });
    const baseURL = cfg?.base_url || this.baseURL;

    // Only use API key from database configuration
    const apiKey = cfg?.api_key?.trim();

    if (!apiKey) {
      throw new Error('TopupMate API key not found in configuration. Please configure it in the admin panel.');
    }

    this.api = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${apiKey}`,
      },
      timeout: 30000,
    });

    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        logger.info(`TopupMate API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        logger.error('TopupMate API Request Error:', error.message);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => {
        logger.info(`TopupMate API Response: ${response.status}`, response.data);
        return response;
      },
      (error) => {
        logger.error('TopupMate API Response Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );

    return this.api;
  }

  // Get service data (networks, plans, etc.)
  async getServiceData(service: string): Promise<TopupmateResponse> {
    try {
      const api = await this.ensureClient();
      const response = await api.get(`/services/`, {
        params: { service },
      });
      return response.data;
    } catch (error: any) {
      logger.error(`Error fetching ${service} data:`, error.message);
      throw new Error(`Failed to fetch ${service} data: ${error.message}`);
    }
  }

  // Get networks
  async getNetworks() {
    return this.getServiceData('network');
  }

  // Get airtime pricing
  async getAirtimePricing() {
    return this.getServiceData('airtime');
  }

  // Get data plans
  async getDataPlans() {
    return this.getServiceData('data');
  }

  // Get data categories
  async getDataCategories() {
    return this.getServiceData('data-category');
  }

  // Get cable providers
  async getCableProviders() {
    return this.getServiceData('cable-provider');
  }

  // Get cable TV plans
  async getCableTVPlans() {
    return this.getServiceData('cabletv');
  }

  // Get electricity providers
  async getElectricityProviders() {
    return this.getServiceData('electricity');
  }

  // Get exam pin providers
  async getExamPinProviders() {
    return this.getServiceData('exampin');
  }

  // Get data pin plans
  async getDataPinPlans() {
    return this.getServiceData('datapin');
  }

  // Get recharge card plans
  async getRechargeCardPlans() {
    return this.getServiceData('recharge-card');
  }

  // Verify account balance (for checking if service is available)
  async checkServiceStatus(service: string): Promise<boolean> {
    try {
      const result = await this.getServiceData(service);
      return result.status === 'success';
    } catch (error) {
      return false;
    }
  }

  // Purchase airtime
  async purchaseAirtime(data: {
    network: string;
    phone: string;
    ref: string;
    airtime_type: string;
    ported_number: boolean;
    amount: string;
  }): Promise<TopupmateResponse> {
    try {
      const api = await this.ensureClient();
      const response = await api.post('/airtime/', data);
      return response.data;
    } catch (error: any) {
      logger.error('Error purchasing airtime:', error.message, error.response?.data);
      const msg = error.response?.data?.msg || error.message;
      throw new Error(`Airtime purchase failed: ${msg}`);
    }
  }

  // Purchase data
  async purchaseData(data: {
    network: string;
    phone: string;
    ref: string;
    plan: string;
    ported_number: boolean;
  }): Promise<TopupmateResponse> {
    try {
      const api = await this.ensureClient();
      const response = await api.post('/data/', data);
      return response.data;
    } catch (error: any) {
      logger.error('Error purchasing data:', error.message, error.response?.data);
      const msg = error.response?.data?.msg || error.message;
      throw new Error(`Data purchase failed: ${msg}`);
    }
  }

  // Verify cable TV account
  async verifyCableAccount(data: {
    provider: string;
    iucnumber: string;
  }): Promise<TopupmateResponse> {
    try {
      const api = await this.ensureClient();
      const response = await api.post('/cable/verify/', data);
      return response.data;
    } catch (error: any) {
      logger.error('Error verifying cable account:', error.message, error.response?.data);
      const msg = error.response?.data?.msg || error.message;
      throw new Error(`Cable verification failed: ${msg}`);
    }
  }

  // Purchase cable TV subscription
  async purchaseCableTV(data: {
    provider: string;
    iucnumber: string;
    plan: string;
    ref: string;
    subtype: 'renew' | 'change';
    phone: string;
  }): Promise<TopupmateResponse> {
    try {
      const api = await this.ensureClient();
      const response = await api.post('/cabletv/', data);
      return response.data;
    } catch (error: any) {
      logger.error('Error purchasing cable TV:', error.message, error.response?.data);
      const msg = error.response?.data?.msg || error.message;
      throw new Error(`Cable TV purchase failed: ${msg}`);
    }
  }

  // Verify electricity meter
  async verifyElectricityMeter(data: {
    provider: string;
    meternumber: string;
    metertype: 'prepaid' | 'postpaid';
  }): Promise<TopupmateResponse> {
    try {
      const api = await this.ensureClient();
      const response = await api.post('/electricity/verify/', data);
      const resData = response.data;
      // Handle both lowercase status and uppercase Status
      if (!resData.status && resData.Status) {
        resData.status = resData.Status.toLowerCase();
      }
      return resData;
    } catch (error: any) {
      logger.error('Error verifying electricity meter:', error.message, error.response?.data);
      const msg = error.response?.data?.msg || error.message;
      throw new Error(`Meter verification failed: ${msg}`);
    }
  }

  // Purchase electricity
  async purchaseElectricity(data: {
    provider: string;
    meternumber: string;
    amount: string;
    metertype: 'prepaid' | 'postpaid';
    phone: string;
    ref: string;
  }): Promise<TopupmateResponse> {
    try {
      const api = await this.ensureClient();
      const response = await api.post('/electricity/', data);
      const resData = response.data;
      // Handle both lowercase status and uppercase Status
      if (!resData.status && resData.Status) {
        resData.status = resData.Status.toLowerCase();
      }
      return resData;
    } catch (error: any) {
      logger.error('Error purchasing electricity:', error.message, error.response?.data);
      const msg = error.response?.data?.msg || error.message;
      throw new Error(`Electricity purchase failed: ${msg}`);
    }
  }

  // Purchase exam pin
  async purchaseExamPin(data: {
    provider: string;
    quantity: string;
    ref: string;
  }): Promise<TopupmateResponse> {
    try {
      const api = await this.ensureClient();
      const response = await api.post('/exampin/', data);
      return response.data;
    } catch (error: any) {
      logger.error('Error purchasing exam pin:', error.message, error.response?.data);
      const msg = error.response?.data?.msg || error.message;
      throw new Error(`Exam pin purchase failed: ${msg}`);
    }
  }

  // Purchase recharge pin
  async purchaseRechargePin(data: {
    network: string;
    quantity: string;
    plan: string;
    businessname: string;
    ref: string;
  }): Promise<TopupmateResponse> {
    try {
      const api = await this.ensureClient();
      const response = await api.post('/rechargepin/', data);
      return response.data;
    } catch (error: any) {
      logger.error('Error purchasing recharge pin:', error.message, error.response?.data);
      const msg = error.response?.data?.msg || error.message;
      throw new Error(`Recharge pin purchase failed: ${msg}`);
    }
  }

  // Purchase data pin
  async purchaseDataPin(data: {
    network: string;
    quantity: string;
    data_plan: string;
    businessname: string;
    ref: string;
  }): Promise<TopupmateResponse> {
    try {
      const api = await this.ensureClient();
      const response = await api.post('/datapin/', data);
      return response.data;
    } catch (error: any) {
      logger.error('Error purchasing data pin:', error.message, error.response?.data);
      const msg = error.response?.data?.msg || error.message;
      throw new Error(`Data pin purchase failed: ${msg}`);
    }
  }

  // Get transaction status
  async getTransactionStatus(reference: string): Promise<TopupmateResponse> {
    try {
      const api = await this.ensureClient();
      const response = await api.get('/transaction/status/', {
        params: { reference },
      });
      return response.data;
    } catch (error: any) {
      logger.error('Error fetching transaction status:', error.message);
      throw new Error(`Failed to fetch transaction status: ${error.message}`);
    }
  }

  // Get wallet balance (account info)
  async getWalletBalance(): Promise<{ balance: number; currency?: string; name?: string; status?: string; raw?: any }> {
    try {
      const api = await this.ensureClient();
      const response = await api.get('/user/');
      const data = response.data as any;
      const rawBalance = data?.balance ?? data?.response?.balance;
      const numeric = typeof rawBalance === 'number'
        ? rawBalance
        : parseFloat(String(rawBalance ?? '0').replace(/,/g, ''));
      return {
        balance: isNaN(numeric) ? 0 : numeric,
        currency: 'NGN',
        name: data?.name,
        status: data?.status,
        raw: data,
      };
    } catch (error: any) {
      logger.error('TopupMate getWalletBalance error:', error.response?.data || error.message);
      throw new Error(`Failed to fetch TopupMate balance: ${error.message}`);
    }
  }

  // Generate unique reference
  generateReference(prefix: string): string {
    return `${prefix}_${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default new TopupmateService();