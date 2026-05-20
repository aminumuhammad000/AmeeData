// services/payrant.service.ts
import axios from 'axios';
import * as crypto from 'crypto';
import ProviderConfig from '../models/provider.model.js';
export class PayrantService {
    config;
    axiosInstance;
    configLoaded;
    constructor() {
        this.config = {
            apiKey: process.env.PAYRANT_API_KEY || '',
            webhookSecret: process.env.PAYRANT_WEBHOOK_SECRET || '',
            baseUrl: process.env.PAYRANT_BASE_URL || 'https://api-core.payrant.com',
        };
        this.configLoaded = false;
        this.axiosInstance = axios.create({
            baseURL: this.config.baseUrl,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.config.apiKey}`,
            },
        });
    }
    async ensureConfig() {
        if (this.configLoaded)
            return;
        try {
            const provider = await ProviderConfig.findOne({ code: 'payrant' });
            const metaEnv = provider?.metadata?.env || {};
            const apiKey = provider?.api_key || metaEnv.PAYRANT_API_KEY || process.env.PAYRANT_API_KEY || '';
            const webhookSecret = provider?.secret_key || metaEnv.PAYRANT_WEBHOOK_SECRET || process.env.PAYRANT_WEBHOOK_SECRET || '';
            const baseUrl = provider?.base_url || metaEnv.PAYRANT_BASE_URL || process.env.PAYRANT_BASE_URL || 'https://api-core.payrant.com';
            this.config = { apiKey, webhookSecret, baseUrl };
            this.axiosInstance.defaults.baseURL = baseUrl;
            this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${apiKey}`;
        }
        catch (e) {
            // Fallback already set via env in constructor
        }
        finally {
            this.configLoaded = true;
        }
    }
    /**
     * Create a virtual account for a user
     */
    // Helper function to sleep for a given duration
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    // Retry configuration
    MAX_RETRIES = 3;
    INITIAL_RETRY_DELAY = 1000; // 1 second
    async createVirtualAccount(data, userId) {
        await this.ensureConfig();
        if (userId) {
            const VirtualAccount = (await import('../models/VirtualAccount.js')).default;
            const existingAccount = await VirtualAccount.findOne({ user: userId, provider: 'payrant' });
            if (existingAccount) {
                return {
                    status: 'exists',
                    account_no: existingAccount.accountNumber,
                    virtualAccountName: existingAccount.accountName,
                    virtualAccountNo: existingAccount.accountNumber,
                    identityType: existingAccount.metadata?.identityType || '',
                    licenseNumber: existingAccount.metadata?.licenseNumber || '',
                    customerName: data.customerName,
                    accountReference: existingAccount.reference || ''
                };
            }
        }
        let lastError = null;
        let attempt = 0;
        // Retry loop
        while (attempt < this.MAX_RETRIES) {
            try {
                attempt++;
                console.log(`🏦 Attempt ${attempt}/${this.MAX_RETRIES}: Creating Payrant virtual account for:`, data.email);
                // Validate document type
                if (!['nin', 'bvn'].includes(data.documentType.toLowerCase())) {
                    throw new Error('Invalid document type. Must be either NIN or BVN');
                }
                // Validate configuration
                if (!this.config.apiKey) {
                    throw new Error('Payrant API key is not configured');
                }
                if (!this.config.baseUrl) {
                    throw new Error('Payrant base URL is not configured');
                }
                const url = `${this.config.baseUrl}/palmpay/`;
                console.log(`🌐 Sending request to: ${url}`);
                // Prepare request data with webhook URL
                const requestData = {
                    ...data,
                    webhookUrl: data.webhookUrl || `${process.env.BACKEND_URL || 'https://api.ibdata.com.ng'}/api/payment/webhook/payrant`
                };
                console.log(`🔔 Webhook URL configured: ${requestData.webhookUrl}`);
                // Make the API request with timeout and retry logic
                console.log('📤 Request Payload:', JSON.stringify(requestData, null, 2));
                console.log('🔑 Authorization Header:', `Bearer ${this.config.apiKey.substring(0, 10)}...`);
                const response = await this.axiosInstance.post('/palmpay/', // Updated endpoint path to match documentation
                requestData, {
                    timeout: 30000, // 30 seconds timeout
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.config.apiKey}`,
                    },
                });
                // Validate response
                if (!response?.data) {
                    throw new Error('Empty or invalid response from Payrant API');
                }
                const responseData = response.data;
                if (!responseData.account_no) {
                    throw new Error('Invalid response format from Payrant API: Missing account_no');
                }
                console.log('✅ Payrant API response:', JSON.stringify(responseData, null, 2));
                // Format the virtual account details
                const virtualAccountDetails = {
                    accountNumber: responseData.account_no,
                    accountName: responseData.virtualAccountName || data.virtualAccountName,
                    bankName: 'PalmPay', // Using PalmPay as default bank name as per VirtualAccount model
                    provider: 'payrant',
                    reference: data.accountReference,
                    status: 'active',
                    isActive: true,
                    metadata: {
                        virtualAccountName: responseData.virtualAccountName,
                        virtualAccountNo: responseData.account_no,
                        identityType: data.documentType,
                        licenseNumber: data.documentNumber
                    }
                };
                // Save to database if userId is provided
                if (userId) {
                    await this.saveVirtualAccountToDatabase(userId, virtualAccountDetails);
                }
                return {
                    status: 'success',
                    account_no: responseData.account_no,
                    virtualAccountName: responseData.virtualAccountName || data.virtualAccountName,
                    virtualAccountNo: responseData.account_no,
                    identityType: data.documentType,
                    licenseNumber: data.documentNumber,
                    customerName: data.customerName,
                    accountReference: data.accountReference
                };
            }
            catch (error) {
                lastError = error;
                // Log the error with attempt number
                console.error(`❌ Attempt ${attempt} failed:`, {
                    message: error.message,
                    code: error.code,
                    config: {
                        url: error.config?.url,
                        method: error.config?.method,
                        data: error.config?.data
                    },
                    response: error.response?.data,
                    stack: error.stack
                });
                // If we have more attempts left, wait before retrying
                if (attempt < this.MAX_RETRIES) {
                    // Exponential backoff: 1s, 2s, 4s, etc.
                    const delay = this.INITIAL_RETRY_DELAY * Math.pow(2, attempt - 1);
                    console.log(`⏳ Retrying in ${delay}ms...`);
                    await this.sleep(delay);
                    continue;
                }
            }
        }
        // If we get here, all retries have failed
        const errorMessage = `Failed to create virtual account after ${this.MAX_RETRIES} attempts. Last error: ${lastError?.message}`;
        console.error('❌', errorMessage);
        throw new Error(errorMessage);
    }
    // Save virtual account to database
    async saveVirtualAccountToDatabase(userId, virtualAccountDetails) {
        try {
            const VirtualAccount = (await import('../models/VirtualAccount.js')).default;
            const account = await VirtualAccount.findOneAndUpdate({ user: userId, provider: 'payrant' }, {
                user: userId,
                ...virtualAccountDetails,
                $setOnInsert: { createdAt: new Date() },
                updatedAt: new Date()
            }, {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true
            });
            console.log('💾 Virtual account saved to database:', account);
            return account;
        }
        catch (dbError) {
            // Log the error but don't fail the request
            console.error('❌ Failed to save virtual account to database:', dbError);
            return false;
        }
    }
    /**
     * Initialize checkout transaction
     */
    async initializeCheckout(data) {
        try {
            await this.ensureConfig();
            // Input validation
            if (!data.email || !data.amount) {
                throw new Error('Email and amount are required');
            }
            if (data.amount <= 0) {
                throw new Error('Amount must be greater than 0');
            }
            console.log('💳 Initializing Payrant checkout:', data.email, data.amount);
            // Prepare request payload
            const payload = {
                email: data.email,
                amount: data.amount,
                callback_url: data.callback_url || `${process.env.FRONTEND_URL}/payment/callback`,
                webhook_url: data.webhook_url || `${process.env.BACKEND_URL || 'https://api.ibdata.com.ng'}/api/payment/payrant/webhook`,
                metadata: data.metadata || {},
            };
            // Validate configuration
            if (!this.config.apiKey) {
                throw new Error('Payrant API key is not configured');
            }
            // Make API request
            const response = await this.axiosInstance.post('/transaction/api.php?action=initialize', payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.config.apiKey}`,
                },
                timeout: 30000, // 30 seconds timeout
            });
            // Handle response
            if (!response.data.status) {
                throw new Error(response.data.message || 'Failed to initialize checkout');
            }
            if (!response.data.data) {
                throw new Error('Invalid response from Payrant: missing data');
            }
            console.log('✅ Checkout initialized:', response.data.data.reference);
            return response.data.data;
        }
        catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Failed to initialize checkout';
            console.error('❌ Payrant initialize checkout error:', errorMessage);
            throw new Error(errorMessage);
        }
    }
    /**
     * Verify transaction status
     */
    async verifyTransaction(reference) {
        try {
            await this.ensureConfig();
            console.log('🔍 Verifying Payrant transaction:', reference);
            const response = await axios.get(`https://payrant.com/api-core/transaction/api.php?action=verify&reference=${reference}`, {
                headers: {
                    'Authorization': `Bearer ${this.config.apiKey}`,
                },
            });
            if (response.data.status) {
                console.log('✅ Transaction verified:', response.data.data.status);
                return response.data.data;
            }
            throw new Error(response.data.message || 'Transaction not found');
        }
        catch (error) {
            console.error('❌ Payrant verify transaction error:', error.response?.data || error.message);
            throw error;
        }
    }
    /**
     * Verify the signature of an incoming webhook
     * @param payload - The webhook payload (string or object)
     * @param signature - The signature from the 'x-payrant-signature' header
     * @returns boolean - True if the signature is valid, false otherwise
     */
    /**
     * Verify the signature of an incoming webhook
     * @param payload - The webhook payload (string or object)
     * @param signature - The signature from the 'x-payrant-signature' header
     * @returns boolean - True if the signature is valid, false otherwise
     */
    verifyWebhookSignature(payload, signature) {
        try {
            // Note: ensureConfig is synchronous-safe here because it only populates fields if not loaded.
            // This function is used in request lifecycle; loading once is acceptable.
            // Use a minimal sync check to avoid blocking if already loaded.
            const maybePromise = this.ensureConfig();
            if (maybePromise && typeof maybePromise.then === 'function') {
                // We intentionally do not await in a sync verifier; config may already be set from env.
            }
            if (!this.config.webhookSecret) {
                console.error('❌ Webhook secret is not configured');
                return false;
            }
            if (!signature) {
                console.error('❌ No signature provided in request');
                return false;
            }
            // Convert payload to string if it's an object
            const payloadString = typeof payload === 'string'
                ? payload
                : JSON.stringify(payload);
            // Create HMAC SHA256 hash
            const hmac = crypto.createHmac('sha256', this.config.webhookSecret);
            const computedSignature = hmac.update(payloadString).digest('hex');
            // Compare the signatures in a timing-safe manner
            const signatureBuffer = Buffer.from(signature);
            const computedBuffer = Buffer.from(computedSignature);
            if (signatureBuffer.length !== computedBuffer.length) {
                return false;
            }
            const isValid = crypto.timingSafeEqual(signatureBuffer, computedBuffer);
            if (!isValid) {
                console.error('❌ Invalid webhook signature');
                console.debug('Expected:', computedSignature);
                console.debug('Received:', signature);
            }
            return isValid;
        }
        catch (error) {
            console.error('❌ Webhook signature validation error:', error);
            return false;
        }
    }
    // Alias for backward compatibility
    validateWebhookSignature(payload, signature) {
        return this.verifyWebhookSignature(payload, signature);
    }
    /**
     * Generate unique account reference
     */
    generateAccountReference(userId) {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 8);
        return `${userId.substring(0, 8)}-${timestamp}-${random}`;
    }
    /**
     * Generate payment reference
     */
    generatePaymentReference(userId) {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 10000);
        return `PAY-${userId.substring(0, 8)}-${timestamp}-${random}`;
    }
    /**
     * Validate account name before transfer
     */
    async validateAccount(bankCode, accountNumber) {
        try {
            await this.ensureConfig();
            console.log('🔍 Validating account:', bankCode, accountNumber);
            const response = await this.axiosInstance.post('/payout/validate_account/', {
                bank_code: bankCode,
                account_number: accountNumber,
            });
            if (response.data.status === 'success') {
                console.log('✅ Account validated:', response.data.data.account_name);
                return response.data.data;
            }
            throw new Error(response.data.message || 'Account validation failed');
        }
        catch (error) {
            console.error('❌ Account validation error:', error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Failed to validate account');
        }
    }
    /**
     * Get list of supported banks
     */
    async getBanksList() {
        try {
            await this.ensureConfig();
            const response = await this.axiosInstance.get('/payout/banks_list/');
            if (response.data.status === 'success') {
                return response.data.data.banks;
            }
            return [];
        }
        catch (error) {
            console.error('❌ Get banks list error:', error.response?.data || error.message);
            return [];
        }
    }
    /**
     * Initiate bank transfer/payout
     */
    async initiateTransfer(data) {
        try {
            await this.ensureConfig();
            console.log('💸 Initiating transfer:', data.amount, 'to', data.account_number);
            const response = await this.axiosInstance.post('/payout/transfer', {
                ...data,
                notify_url: data.notify_url || `${process.env.BACKEND_URL || 'https://api.ibdata.com.ng'}/api/payment/payrant/transfer-webhook`,
            });
            if (response.data.status === 'success') {
                console.log('✅ Transfer initiated:', response.data.data.reference);
                return response.data.data;
            }
            throw new Error(response.data.message || 'Transfer failed');
        }
        catch (error) {
            console.error('❌ Transfer initiation error:', error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Failed to initiate transfer');
        }
    }
}
export const payrantService = new PayrantService();
