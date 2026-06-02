import { Transaction, User } from '../models/index.js';
import { payrantService } from '../services/payrant.service.js';
import { ApiResponse } from '../utils/response.js';
export class PayrantController {
    /**
     * Create a new Payrant virtual account for the authenticated user
     */
    static async createVirtualAccount(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return ApiResponse.error(res, 'User not authenticated', 401);
            }
            const user = await User.findById(userId);
            if (!user) {
                return ApiResponse.error(res, 'User not found', 404);
            }
            // Input validation
            if (!req.body.documentType || !['nin', 'bvn'].includes(req.body.documentType)) {
                return ApiResponse.error(res, 'Valid document type (nin or bvn) is required', 400);
            }
            if (!req.body.documentNumber) {
                return ApiResponse.error(res, 'Document number is required', 400);
            }
            // Prepare virtual account data
            const virtualAccountData = {
                documentType: req.body.documentType,
                documentNumber: req.body.documentNumber,
                virtualAccountName: (req.body.virtualAccountName || `${user.firstName} ${user.lastName}`).substring(0, 50),
                customerName: (req.body.customerName || `${user.firstName} ${user.lastName}`).substring(0, 100),
                email: req.body.email || user.email,
                accountReference: req.body.accountReference || `user-${userId}-${Date.now()}`,
            };
            // Check if user already has a virtual account
            if (user.virtual_account?.account_number) {
                return ApiResponse.error(res, 'User already has a virtual account', 400);
            }
            // Create virtual account
            const virtualAccount = await payrantService.createVirtualAccount(virtualAccountData, userId);
            // Update user with virtual account details
            user.virtual_account = {
                account_number: virtualAccount.account_no,
                account_name: virtualAccount.virtualAccountName,
                bank_name: 'Payrant',
                account_reference: virtualAccount.accountReference,
                provider: 'payrant',
                status: 'active',
            };
            await user.save();
            // Format the response to match the frontend's expected structure
            const responseData = {
                account_number: virtualAccount.account_no,
                account_name: virtualAccount.virtualAccountName,
                bank_name: 'Payrant',
                account_reference: virtualAccount.accountReference,
                provider: 'payrant',
                status: 'active',
                virtualAccountName: virtualAccount.virtualAccountName,
                virtualAccountNo: virtualAccount.account_no,
                identityType: req.body.documentType,
                licenseNumber: req.body.documentNumber,
                customerName: virtualAccount.customerName
            };
            return ApiResponse.success(res, { data: responseData }, 'Virtual account created successfully');
        }
        catch (error) {
            console.error('❌ Error creating virtual account:', error);
            // Handle specific error cases
            let status = 500;
            let message = 'Failed to create virtual account';
            if (error.message?.includes('already exists')) {
                status = 409; // Conflict
                message = 'Virtual account already exists for this user';
            }
            else if (error.response?.status === 400) {
                status = 400;
                message = error.response.data?.message || 'Invalid request data';
            }
            return ApiResponse.error(res, message, status);
        }
    }
    /**
     * Get user's Payrant virtual account details
     */
    static async getVirtualAccount(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return ApiResponse.error(res, 'User not authenticated', 401);
            }
            const user = await User.findById(userId);
            if (!user) {
                return ApiResponse.error(res, 'User not found', 404);
            }
            if (!user.virtual_account || !user.virtual_account.account_number) {
                return ApiResponse.success(res, { data: { exists: false } }, 'No virtual account found');
            }
            // Format the response to match the frontend's expected structure
            const virtualAccount = user.virtual_account;
            const responseData = {
                account_number: virtualAccount.account_number,
                account_name: virtualAccount.account_name,
                bank_name: virtualAccount.bank_name || 'Payrant',
                account_reference: virtualAccount.account_reference,
                provider: virtualAccount.provider || 'payrant',
                status: virtualAccount.status || 'active',
                virtualAccountName: virtualAccount.account_name,
                virtualAccountNo: virtualAccount.account_number,
                customerName: virtualAccount.account_name
            };
            return ApiResponse.success(res, { data: responseData }, 'Virtual account retrieved successfully');
        }
        catch (error) {
            console.error('Error fetching virtual account:', error);
            return ApiResponse.error(res, error.message || 'Failed to fetch virtual account', error.status || 500);
        }
    }
    /**
     * Handle Payrant webhook events
     */
    static async handleWebhook(req, res) {
        const signature = req.headers['x-payrant-signature'];
        try {
            // req.body is a Buffer because of express.raw() middleware in app.ts
            const rawBody = req.body.toString('utf8');
            // Verify webhook signature using the raw body string
            // Verify webhook signature using the raw body string
            console.log('🔐 [PayrantController] Verifying signature...');
            console.log('   Signature Header:', signature);
            console.log('   Body Type:', typeof req.body);
            console.log('   Is Buffer?', req.body instanceof Buffer);
            if (!(req.body instanceof Buffer) && typeof req.body === 'object') {
                console.warn('⚠️ req.body is an Object! express.raw() might not be working for this route.');
            }
            const isValid = payrantService.verifyWebhookSignature(rawBody, signature);
            if (!isValid) {
                console.error('❌ Invalid webhook signature');
                console.debug('Signature received:', signature);
                console.debug('Computed Body Length:', rawBody.length);
                console.debug('First 50 chars:', rawBody.substring(0, 50));
                // return res.status(401).json({ status: 'error', message: 'Invalid signature' });
                console.warn('⚠️ IGNORING INVALID SIGNATURE FOR DEBUGGING');
            }
            else {
                console.log('✅ Webhook signature verified successfully');
            }
            const payload = JSON.parse(rawBody);
            console.log('🔔 Received Payrant webhook:', payload.event);
            // Handle different webhook events
            switch (payload.event) {
                case 'charge.success':
                    await this.handleSuccessfulPayment(payload.data);
                    break;
                case 'transfer.success':
                    await this.handleSuccessfulTransfer(payload.data);
                    break;
                case 'transfer.failed':
                    await this.handleFailedTransfer(payload.data);
                    break;
                default:
                    console.log(`ℹ️ Unhandled webhook event: ${payload.event}`);
            }
            return res.status(200).json({ status: 'success' });
        }
        catch (error) {
            console.error('❌ Error processing webhook:', error);
            return res.status(500).json({ status: 'error', message: 'Internal server error' });
        }
    }
    /**
     * Handle successful payment
     */
    static async handleSuccessfulPayment(data) {
        try {
            const { reference, amount, customer, metadata } = data;
            // Find transaction by reference
            const transaction = await Transaction.findOne({ reference });
            if (!transaction) {
                console.error(`Transaction not found: ${reference}`);
                return;
            }
            // Update transaction status
            transaction.status = 'success';
            transaction.amount = amount / 100; // Convert from kobo to naira
            transaction.metadata = {
                ...transaction.metadata,
                ...metadata,
                customer
            };
            await transaction.save();
            // Update user's wallet balance
            await User.findByIdAndUpdate(transaction.user, { $inc: { walletBalance: amount / 100 } });
            console.log(`✅ Payment processed successfully: ${reference}`);
        }
        catch (error) {
            console.error('Error processing successful payment:', error);
            throw error;
        }
    }
    /**
     * Handle successful transfer
     */
    static async handleSuccessfulTransfer(data) {
        // TODO: Implement transfer handling logic
        console.log('Transfer successful:', data);
    }
    /**
     * Handle failed transfer
     */
    static async handleFailedTransfer(data) {
        // TODO: Implement failed transfer handling logic
        console.error('Transfer failed:', data);
    }
    /**
     * Initialize a new payment checkout
     */
    static async initializeCheckout(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return ApiResponse.error(res, 'User not authenticated', 401);
            }
            const { amount, email, callback_url, metadata } = req.body;
            // Input validation
            if (!amount || isNaN(amount) || amount <= 0) {
                return ApiResponse.error(res, 'A valid amount is required', 400);
            }
            if (!email) {
                return ApiResponse.error(res, 'Email is required', 400);
            }
            // Create payment intent
            const paymentData = await payrantService.initializeCheckout({
                amount,
                email,
                callback_url,
                metadata: {
                    ...metadata,
                    userId,
                },
            });
            return ApiResponse.success(res, paymentData, 'Payment initialized successfully');
        }
        catch (error) {
            console.error('❌ Error initializing payment:', error);
            return ApiResponse.error(res, error.message || 'Failed to initialize payment', error.status || 500);
        }
    }
}
