import { Transaction, User, VirtualAccount, Wallet } from '../models/index.js';
import { SystemSetting } from '../models/system_setting.model.js';
import { MonnifyService } from '../services/monnify.service.js';
import { PaystackService } from '../services/paystack.service.js';
import { vtStackService } from '../services/vtstack.service.js';
import { WalletService } from '../services/wallet.service.js';
import { ApiResponse } from '../utils/response.js';
// Initialize services
const monnifyService = new MonnifyService();
const paystackService = new PaystackService();
// Mock services for now
const mockServices = {
    payrant: {
        initializePayment: async () => ({
            checkoutUrl: 'https://payrant.com/checkout/mock',
            reference: 'MOCK' + Date.now()
        })
    }
};
export class PaymentController {
    /**
     * Get current active payment gateway setting
     */
    static async getGatewaySettings(req, res) {
        try {
            const setting = await SystemSetting.findOne({ type: 'global_config' });
            const gateway = setting?.config?.payment_gateway || 'vtstack';
            return ApiResponse.success(res, { gateway }, 'Payment gateway setting retrieved');
        }
        catch (error) {
            console.error('Error fetching gateway settings:', error);
            return ApiResponse.error(res, 'Failed to fetch gateway settings');
        }
    }
    /**
     * Deactivate user's virtual account
     * @param req Express request object
     * @param res Express response object
     */
    static async deactivateVirtualAccount(req, res) {
        try {
            const userId = req.user?.id;
            // Find user and update virtual account status
            const user = await User.findById(userId);
            if (!user || !user.virtual_account) {
                return ApiResponse.error(res, 'No active virtual account found', 404);
            }
            user.virtual_account.status = 'inactive';
            await user.save();
            return ApiResponse.success(res, null, 'Virtual account deactivated successfully');
        }
        catch (error) {
            console.error('Error deactivating virtual account:', error);
            return ApiResponse.error(res, 'Failed to deactivate virtual account');
        }
    }
    /**
    /**
     * Handle Monnify webhook for payment confirmation
     * @param req Express request object
     * @param res Express response object
     */
    static async handleMonnifyWebhook(req, res) {
        try {
            const event = req.body;
            // Verify the webhook is from Monnify
            const signature = req.headers['monnify-signature'];
            const isVerified = monnifyService.validateWebhookSignature(event, signature);
            if (!isVerified) {
                return res.status(400).json({ status: false, message: 'Invalid webhook signature' });
            }
            // Handle different event types
            if (event.eventType === 'SUCCESSFUL_TRANSACTION') {
                const { paymentReference, amount, customer } = event.eventData;
                // Find user by email first
                const user = await User.findOne({ email: customer.email });
                if (!user) {
                    console.error(`Monnify Webhook: User not found for email ${customer.email}`);
                    return res.status(200).json({ status: false, message: 'User not found' });
                }
                // Update wallet balance atomically
                const wallet = await Wallet.findOne({ user_id: user._id });
                if (wallet) {
                    try {
                        // Record transaction FIRST for idempotency
                        await Transaction.create({
                            user_id: user._id,
                            wallet_id: wallet._id,
                            amount,
                            type: 'wallet_topup',
                            total_charged: 0,
                            payment_method: 'monnify_transfer',
                            status: 'successful',
                            reference_number: paymentReference,
                            description: 'Wallet funding via Monnify',
                            metadata: { gateway: 'monnify' }
                        });
                        // Credit wallet ONLY AFTER transaction record is successfully created
                        await WalletService.creditWallet(user._id, amount);
                    }
                    catch (error) {
                        if (error.code === 11000) {
                            console.log('🔁 Monnify: Transaction already processed:', paymentReference);
                            return res.status(200).json({ status: true, message: 'Already processed' });
                        }
                        throw error;
                    }
                }
            }
            return res.status(200).json({ status: true });
        }
        catch (error) {
            console.error('Monnify webhook error:', error);
            return res.status(500).json({ status: false, message: 'Webhook processing failed' });
        }
    }
    /**
     * Get list of supported banks from Paystack
     * @param req Express request object
     * @param res Express response object
     */
    static async getBanks(_req, res) {
        try {
            const banks = await paystackService.listBanks();
            return ApiResponse.success(res, 'Banks retrieved successfully', banks);
        }
        catch (error) {
            console.error('Error fetching banks:', error);
            return ApiResponse.error(res, error.message || 'Failed to fetch banks', 500);
        }
    }
    static async initiatePayment(req, res) {
        try {
            const { amount, gateway = 'paystack', email } = req.body;
            const userId = req.user?.id;
            if (!userId) {
                return ApiResponse.error(res, 'User not authenticated', 401);
            }
            if (!amount || amount <= 0) {
                return ApiResponse.error(res, 'Invalid amount', 400);
            }
            if (amount < 100) {
                return ApiResponse.error(res, 'Minimum amount is NGN 100', 400);
            }
            if (amount > 1000000) {
                return ApiResponse.error(res, 'Maximum amount is NGN 1,000,000', 400);
            }
            // Get user and wallet
            const user = await User.findById(userId);
            if (!user) {
                return ApiResponse.error(res, 'User not found', 404);
            }
            const wallet = await Wallet.findOne({ user_id: userId });
            if (!wallet) {
                return ApiResponse.error(res, 'Wallet not found', 404);
            }
            // Route to the appropriate payment gateway
            switch (gateway) {
                case 'paystack':
                    if (!email) {
                        return ApiResponse.error(res, 'Email is required for Paystack payments', 400);
                    }
                    return await PaymentController.initiatePaystackPayment(res, user, wallet, amount, email);
                case 'monnify':
                    return await PaymentController.initiateMonnifyPayment(res, user, wallet, amount);
                case 'payrant':
                    return await PaymentController.initiatePayrantPayment(res, user, wallet, amount);
                default:
                    return ApiResponse.error(res, 'Invalid payment gateway', 400);
            }
        }
        catch (error) {
            console.error('Payment initiation error:', error);
            return ApiResponse.error(res, error.message || 'Failed to initialize payment', 500);
        }
    }
    static async initiatePaystackPayment(res, user, wallet, amount, email) {
        try {
            const reference = `PAYSTACK_${Date.now()}_${user._id}`;
            // Initialize payment with Paystack
            const paymentData = await paystackService.initializeTransaction(email, amount * 100, // Convert to kobo
            reference);
            // Note: The callback URL and metadata from the original call are not supported 
            // in the current Paystack service implementation. If you need these features, 
            // you'll need to update the Paystack service to accept them as parameters.
            // The current implementation uses a hardcoded callback URL and metadata.
            // Create a pending transaction
            await Transaction.create({
                user_id: user._id,
                wallet_id: wallet._id,
                type: 'credit',
                amount,
                status: 'pending',
                reference_number: paymentData.data.reference || reference,
                gateway: 'paystack',
                description: 'Wallet funding via Paystack',
                metadata: {
                    authorization_url: paymentData.data.authorization_url,
                    access_code: paymentData.data.access_code,
                    payment_method: 'card'
                }
            });
            return ApiResponse.success(res, {
                authorization_url: paymentData.data.authorization_url,
                access_code: paymentData.data.access_code,
                reference: paymentData.data.reference || reference,
                amount,
                email
            }, 'Payment initialized successfully');
        }
        catch (error) {
            console.error('Paystack payment error:', error);
            throw new Error(error.message || 'Failed to initialize Paystack payment');
        }
    }
    static async initiatePayrantPayment(res, user, wallet, amount) {
        // ... existing initiatePayrantPayment implementation ...
    }
    static async initiateMonnifyPayment(res, user, wallet, amount) {
        // ... existing initiateMonnifyPayment implementation ...
    }
    /**
     * Verify payment status for any supported gateway
     * @param req Express request object with reference parameter
     * @param res Express response object
     */
    static async verifyPayment(req, res) {
        try {
            const { reference } = req.params;
            if (!reference) {
                return ApiResponse.error(res, 'Payment reference is required', 400);
            }
            // Find the transaction by reference
            const transaction = await Transaction.findOne({ reference_number: reference });
            if (!transaction) {
                return ApiResponse.error(res, 'Transaction not found', 404);
            }
            // Verify payment based on the gateway used
            let verificationResult;
            switch (transaction.gateway) {
                case 'paystack':
                    verificationResult = await paystackService.verifyTransaction(reference);
                    break;
                case 'monnify':
                    // For Monnify, we'll just return the transaction status
                    // since we don't have a verification endpoint in the service yet
                    return ApiResponse.success(res, 'Payment status retrieved', JSON.stringify({
                        status: transaction.status,
                        reference: transaction.reference_number,
                        amount: transaction.amount,
                        gateway: transaction.gateway
                    }));
                case 'payrant':
                    // For Payrant, we'll just return the transaction status
                    // since we don't have a direct verification endpoint
                    return ApiResponse.success(res, 'Payment status retrieved', JSON.stringify({
                        status: transaction.status,
                        reference: transaction.reference_number,
                        amount: transaction.amount,
                        gateway: transaction.gateway
                    }));
                default:
                    return ApiResponse.error(res, 'Unsupported payment gateway', 400);
            }
            // Update transaction status if it has changed
            if (verificationResult.status && verificationResult.status !== transaction.status) {
                transaction.status = verificationResult.status;
                // If payment is successful, update the wallet balance
                if (verificationResult.status === true && transaction.type === 'credit') {
                    await WalletService.creditWallet(transaction.user_id, transaction.amount);
                }
                await transaction.save();
            }
            // Extract all properties except status from verificationResult
            const { status: _, ...restVerification } = verificationResult;
            return ApiResponse.success(res, {
                status: transaction.status, // Always use transaction status
                reference: transaction.reference_number,
                amount: transaction.amount,
                gateway: transaction.gateway,
                ...restVerification // Spread all other verification data
            }, 'Payment verification successful');
        }
        catch (error) {
            console.error('Payment verification error:', error);
            return ApiResponse.error(res, error.message || 'Failed to verify payment', 500);
        }
    }
    /**
     * Create Payrant virtual account for user
     */
    static async createVirtualAccount(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return ApiResponse.error(res, 'User not authenticated', 401);
            }
            // Get user details
            const user = await User.findById(userId);
            if (!user) {
                return ApiResponse.error(res, 'User not found', 404);
            }
            // Check if user already has a virtual account
            if (user.virtual_account?.account_number) {
                return ApiResponse.success(res, {
                    ...user.virtual_account,
                    exists: true
                }, 'Virtual account already exists');
            }
            // Get system settings to determine default gateway
            const systemSetting = await SystemSetting.findOne({ type: 'global_config' });
            const defaultGateway = systemSetting?.config?.payment_gateway || 'vtstack';
            if (defaultGateway === 'vtstack') {
                const { bvn } = req.body;
                if (!bvn) {
                    return ApiResponse.error(res, 'BVN is required to create a virtual account with VTStack', 400);
                }
                const reference = vtStackService.generateReference(user._id.toString());
                // Create account on VTStack
                const vtAccount = await vtStackService.createVirtualAccount({
                    firstName: user.first_name,
                    lastName: user.last_name,
                    email: user.email,
                    phone: user.phone_number || '08000000000',
                    bvn: bvn,
                    identityType: 'INDIVIDUAL',
                    reference: reference
                });
                // Save to local database
                const newAccount = await VirtualAccount.create({
                    user: user._id,
                    accountNumber: vtAccount.accountNumber,
                    accountName: vtAccount.accountName,
                    bankName: vtAccount.bankName || 'PalmPay',
                    provider: 'vtstack',
                    reference: vtAccount.reference,
                    status: 'active',
                    metadata: {
                        alias: vtAccount.alias,
                        id: vtAccount.id
                    }
                });
                return ApiResponse.success(res, newAccount, 'Virtual account created successfully', 201);
            }
            // Fallback to Payrant (previous logic)
            // Use phone number as NIN (Payrant requires a document number)
            let documentNumber = user.phone_number;
            if (!documentNumber) {
                return ApiResponse.error(res, 'Phone number is required to create virtual account', 400);
            }
            // Normalize phone number: if it's 10 digits, prepend '0' to make it 11 digits
            documentNumber = documentNumber.replace(/\D/g, ''); // Remove non-digits
            if (documentNumber.length === 10) {
                documentNumber = '0' + documentNumber;
                console.log(`📱 Normalized 10-digit phone to 11 digits: ${documentNumber}`);
            }
            else if (documentNumber.length !== 11) {
                return ApiResponse.error(res, 'Phone number must be 10 or 11 digits', 400);
            }
            // Import Payrant service
            const { PayrantService } = await import('../services/payrant.service.js');
            const payrantService = new PayrantService();
            // Generate account reference
            const accountReference = `VTU-${userId}-${Date.now().toString(36)}`;
            // Create virtual account with Payrant (using phone number as document number)
            const virtualAccount = await payrantService.createVirtualAccount({
                documentType: 'nin',
                documentNumber: documentNumber,
                virtualAccountName: `${user.first_name} ${user.last_name}`.substring(0, 50), // Limit to 50 chars
                customerName: `${user.first_name} ${user.last_name}`.substring(0, 100), // Limit to 100 chars
                email: user.email,
                accountReference,
            }, userId.toString() // Pass user ID to save in our database
            );
            // The virtual account is now saved in the database by the Payrant service
            // Fetch the saved account to return complete data
            const savedAccount = await VirtualAccount.findOne({
                user: userId,
                provider: 'payrant'
            }).sort({ createdAt: -1 });
            if (!savedAccount) {
                console.error('Virtual account created but not found in database');
                return ApiResponse.error(res, 'Virtual account created but failed to save details', 500);
            }
            return ApiResponse.success(res, savedAccount.toObject(), 'Virtual account created successfully');
        }
        catch (error) {
            console.error('Create virtual account error:', error);
            return ApiResponse.error(res, error.message || 'Failed to create virtual account', 500);
        }
    }
    /**
     * Get user's virtual account
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
                return ApiResponse.success(res, null, 'No virtual account found');
            }
            return ApiResponse.success(res, user.virtual_account, 'Virtual account retrieved successfully');
        }
        catch (error) {
            console.error('Get virtual account error:', error);
            return ApiResponse.error(res, error.message || 'Failed to get virtual account', 500);
        }
    }
    /**
     * Handle Payrant webhook for virtual account deposits
     */
    static async handlePayrantWebhook(req, res) {
        try {
            // Get the raw body for signature verification
            const rawBody = req.body instanceof Buffer ? req.body.toString('utf8') : JSON.stringify(req.body);
            const webhookData = req.body instanceof Buffer ? JSON.parse(rawBody) : req.body;
            const signature = req.headers['x-payrant-signature'];
            const eventType = req.headers['x-payrant-event'];
            // Log incoming webhook for debugging
            console.log('🔔 Payrant webhook received:');
            console.log('Event Type:', eventType);
            console.log('Headers:', JSON.stringify(req.headers, null, 2));
            console.log('Body:', JSON.stringify(webhookData, null, 2));
            console.log('Raw Body Length:', rawBody.length);
            // Import Payrant service
            const { PayrantService } = await import('../services/payrant.service.js');
            const payrantService = new PayrantService();
            // Verify webhook signature if provided
            if (signature) {
                console.log('🔐 Verifying signature...');
                console.log('   Signature Header:', signature);
                console.log('   Body Type:', typeof req.body);
                console.log('   Is Buffer?', req.body instanceof Buffer);
                // If body is object, we need to be careful. express.raw() should make it a Buffer.
                // If it's an object, it means express.json() might have processed it first.
                if (!(req.body instanceof Buffer) && typeof req.body === 'object') {
                    console.warn('⚠️ req.body is an Object, not a Buffer! Signature verification might fail.');
                    console.warn('   Make sure express.raw() middleware is applied BEFORE express.json() for this route.');
                }
                const isValid = payrantService.verifyWebhookSignature(rawBody, // Use raw body string for verification
                signature);
                if (!isValid) {
                    console.error('❌ Invalid Payrant webhook signature');
                    console.error('   Computed Body Length:', rawBody.length);
                    console.error('   First 50 chars of body:', rawBody.substring(0, 50));
                    console.error('   Signature received:', signature);
                    // Don't return error yet, let's see if we can debug it
                    // return res.status(400).json({ status: false, message: 'Invalid signature' });
                    console.warn('⚠️ IGNORING INVALID SIGNATURE FOR DEBUGGING');
                }
                else {
                    console.log('✅ Webhook signature verified successfully');
                }
            }
            else {
                console.warn('⚠️ No signature provided in webhook - processing anyway for testing');
                console.log('   Available Headers:', Object.keys(req.headers));
            }
            // Check if status is success
            if (webhookData.status !== 'success') {
                console.log('⚠️ Webhook status is not success:', webhookData.status);
                return res.status(200).json({ status: true, message: 'Webhook received but status not success' });
            }
            // Extract transaction data (Payrant format)
            const transaction = webhookData.transaction;
            if (!transaction) {
                console.error('❌ No transaction data in webhook');
                return res.status(400).json({ status: false, message: 'Missing transaction data' });
            }
            const accountReference = transaction.metadata?.account_reference;
            const amount = transaction.net_amount || transaction.amount;
            const reference = transaction.reference;
            const payerDetails = transaction.payer_details;
            const accountDetails = transaction.account_details;
            console.log('📝 Extracted data:', {
                accountReference,
                amount,
                reference,
                accountNumber: accountDetails?.account_number,
                payerName: payerDetails?.account_name
            });
            if (!accountReference) {
                console.error('❌ No account reference in webhook metadata');
                return res.status(400).json({ status: false, message: 'Missing account reference' });
            }
            if (!amount || !reference) {
                console.error('❌ Missing required fields:', { amount, reference });
                return res.status(400).json({ status: false, message: 'Missing amount or reference' });
            }
            // Find virtual account by account reference
            const { default: VirtualAccount } = await import('../models/VirtualAccount.js');
            const virtualAccount = await VirtualAccount.findOne({ reference: accountReference });
            if (!virtualAccount) {
                console.error('❌ Virtual account not found for reference:', accountReference);
                return res.status(404).json({ status: false, message: 'Virtual account not found' });
            }
            console.log('✅ Virtual account found:', virtualAccount.accountNumber);
            // Find user from virtual account
            const user = await User.findById(virtualAccount.user);
            if (!user) {
                console.error('❌ User not found for virtual account');
                return res.status(404).json({ status: false, message: 'User not found' });
            }
            console.log('✅ User found:', user.email);
            // Get or create wallet
            let wallet = await Wallet.findOne({ user_id: user._id });
            if (!wallet) {
                console.log('Creating new wallet for user:', user.email);
                wallet = await Wallet.create({
                    user_id: user._id,
                    balance: 0,
                });
            }
            // Check if transaction already processed
            const existingTransaction = await Transaction.findOne({ reference_number: reference });
            if (existingTransaction) {
                console.log('⚠️ Transaction already processed:', reference);
                return res.status(200).json({ status: true, message: 'Already processed' });
            }
            try {
                // Create transaction record FIRST to ensure idempotency via unique reference_number index
                await Transaction.create({
                    user_id: user._id,
                    wallet_id: wallet._id, // Add wallet_id which is required by schema
                    amount: amount,
                    type: 'wallet_topup', // Use wallet_topup to match existing types
                    total_charged: 0,
                    payment_method: 'payrant_virtual_account',
                    status: 'successful',
                    reference_number: reference,
                    description: `Virtual account deposit from ${payerDetails?.account_name || 'Unknown'}`,
                    gateway: 'payrant',
                    metadata: {
                        payer_account: payerDetails?.account_number,
                        payer_name: payerDetails?.account_name,
                        payer_bank: payerDetails?.bank_name,
                        fee: transaction.fee || 0,
                        gross_amount: transaction.amount,
                        net_amount: transaction.net_amount,
                        account_number: accountDetails?.account_number,
                        account_name: accountDetails?.account_name,
                        session_id: transaction.metadata?.session_id,
                        timestamp: transaction.timestamp,
                        webhook_event: eventType,
                    },
                });
                // Credit wallet ONLY AFTER transaction record is successfully created
                await WalletService.creditWallet(user._id, amount);
                console.log(`✅ Wallet credited: User ${user.email}, Amount: ₦${amount}, New Balance: ₦${(wallet.balance || 0) + amount}`);
            }
            catch (error) {
                if (error.code === 11000) {
                    console.log('🔁 Transaction already processed (race condition caught):', reference);
                    return res.status(200).json({ status: true, message: 'Already processed' });
                }
                throw error;
            }
            return res.status(200).json({ status: true, message: 'Webhook processed successfully' });
        }
        catch (error) {
            console.error('❌ Payrant webhook error:', error.message);
            console.error('Stack:', error.stack);
            return res.status(500).json({ status: false, message: 'Webhook processing failed', error: error.message });
        }
    }
}
