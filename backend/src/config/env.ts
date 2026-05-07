// config/env.ts


interface PaystackConfig {
  secretKey: string;
  publicKey: string;
  baseUrl: string;
  webhookSecret: string;
}

interface MonnifyConfig {
  apiKey: string;
  secretKey: string;
  contractCode: string;
  baseUrl: string;
}

interface TopupmateConfig {
  apiKey: string;
  baseUrl: string;
}

interface ServiceCharges {
  airtime: number;
  data: number;
  cable: number;
  electricity: number;
  exampin: number;
}

export interface Config {
  port: number;
  nodeEnv: string;
  appUrl: string;
  mongoUri: string;
  jwtSecret: string;
  jwtExpiry: string;
  otpExpiry: number;
  corsOrigin: string;
  logLevel: string;
  paystack: PaystackConfig;
  monnify: MonnifyConfig;
  topupmate: TopupmateConfig;
  serviceCharges: ServiceCharges;
  fundingAccount: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    instructions?: string;
  };
}

export const config: Config = {
  // Server Configuration
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  appUrl: process.env.APP_URL || 'http://localhost:5000',

  // Database
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/connecta_vtu',

  // JWT Authentication
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  jwtExpiry: process.env.JWT_EXPIRY || '24h',

  // OTP Configuration
  otpExpiry: parseInt(process.env.OTP_EXPIRY || '300000'), // 5 minutes

  // CORS & Logging
  corsOrigin: process.env.CORS_ORIGIN || '*',
  logLevel: process.env.LOG_LEVEL || 'info',

  // Paystack Configuration
  paystack: {
    secretKey: process.env.PAYSTACK_SECRET_KEY || '111111111111111111111111',
    publicKey: process.env.PAYSTACK_PUBLIC_KEY || '111111111111111111111111',
    baseUrl: 'https://api.paystack.co',
    webhookSecret: process.env.PAYSTACK_WEBHOOK_SECRET || '',
  },

  // Monnify Configuration (if needed)
  monnify: {
    apiKey: process.env.MONNIFY_API_KEY || '111111111111111111111111',
    secretKey: process.env.MONNIFY_SECRET_KEY || '111111111111111111111111',
    contractCode: process.env.MONNIFY_CONTRACT_CODE || '',
    baseUrl: process.env.MONNIFY_BASE_URL || 'https://api.monnify.com/api/v1',
  },

  // TopupMate Configuration
  topupmate: {
    apiKey: process.env.TOPUPMATE_API_KEY || '',
    baseUrl: process.env.TOPUPMATE_BASE_URL || 'https://connect.topupmate.com/api',
  },

  // Service charges (percentage or flat amount - optional)
  serviceCharges: {
    airtime: parseFloat(process.env.AIRTIME_SERVICE_CHARGE || '0'),
    data: parseFloat(process.env.DATA_SERVICE_CHARGE || '0'),
    cable: parseFloat(process.env.CABLE_SERVICE_CHARGE || '0'),
    electricity: parseFloat(process.env.ELECTRICITY_SERVICE_CHARGE || '0'),
    exampin: parseFloat(process.env.EXAMPIN_SERVICE_CHARGE || '0'),
  },
  // Default funding account details
  fundingAccount: {
    bankName: process.env.FUNDING_BANK_NAME || 'Access Bank',
    accountName: process.env.FUNDING_ACCOUNT_NAME || 'Topupmate connect/ Aminu(Topupmate)',
    accountNumber: process.env.FUNDING_ACCOUNT_NUMBER || '6600392859',
    instructions: process.env.FUNDING_INSTRUCTIONS || 'Transfer to this account and notify support with your reference.',
  }
};

export default config;