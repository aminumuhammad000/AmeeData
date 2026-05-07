import { Request, Response } from 'express';
import { Types } from 'mongoose';
import VirtualAccount from '../models/VirtualAccount.js';
import { Transaction, User, Wallet } from '../models/index.js';
import { vtStackService } from '../services/vtstack.service.js';
import { WalletService } from '../services/wallet.service.js';
import { AuthRequest } from '../types/index.js';
import { ApiResponse } from '../utils/response.js';

export class VTStackController {

    /**
     * Create a new Virtual Account for the authorized user
     */
    static async createAccount(req: AuthRequest, res: Response) {
        try {
            const userSession = req.user;
            if (!userSession) {
                return ApiResponse.error(res, 'User not found', 404);
            }

            const user = await User.findById(userSession.id);
            if (!user) {
                return ApiResponse.error(res, 'User not found in database', 404);
            }

            // Check if user already has a VTStack account
            const existingAccount = await VirtualAccount.findOne({
                user: user._id,
                provider: 'vtstack'
            });

            if (existingAccount) {
                return ApiResponse.success(res, existingAccount, 'Virtual account already exists');
            }

            const { bvn } = req.body;
            if (!bvn) {
                return ApiResponse.error(res, 'BVN is required to create a virtual account', 400);
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

        } catch (error: any) {
            console.error('VTStack Create Account Error:', error);
            return ApiResponse.error(res, error.message || 'Failed to create virtual account', 500);
        }
    }

    /**
     * Get User's Virtual Accounts
     */
    static async getMyAccounts(req: AuthRequest, res: Response) {
        try {
            const accounts = await VirtualAccount.find({ user: req.user?.id, provider: 'vtstack' });
            return ApiResponse.success(res, accounts, 'Virtual accounts retrieved');
        } catch (error: any) {
            return ApiResponse.error(res, error.message, 500);
        }
    }

    /**
     * Get real-time balance for an account
     */
    static async getAccountBalance(req: AuthRequest, res: Response) {
        try {
            const { accountNumber } = req.params;

            // Verify ownership
            const account = await VirtualAccount.findOne({
                user: req.user?.id,
                accountNumber,
                provider: 'vtstack'
            });

            if (!account) {
                return ApiResponse.error(res, 'Account not found or access denied', 404);
            }

            const balanceData = await vtStackService.getAccountBalance(accountNumber);
            return ApiResponse.success(res, balanceData, 'Account balance retrieved');

        } catch (error: any) {
            return ApiResponse.error(res, error.message, 500);
        }
    }

    /**
     * Handle Webhook notifications from VTStack
     */
    static async webhook(req: Request, res: Response) {
        try {
            // req.body may be a raw Buffer if the server uses raw body parsing for webhooks
            // Parse it to JSON if needed
            let payload: any;
            if (Buffer.isBuffer(req.body)) {
                try {
                    payload = JSON.parse(req.body.toString('utf8'));
                } catch (parseErr) {
                    console.error('❌ VTStack Webhook: Failed to parse Buffer body');
                    return res.status(400).json({ success: false, message: 'Invalid payload' });
                }
            } else {
                payload = req.body;
            }

            console.log('🔔 VTStack Webhook received:', JSON.stringify(payload, null, 2));

            // VTStack sends event as 'transaction.deposit' (not 'payment.success')
            const isDeposit = payload.event === 'transaction.deposit' || payload.event === 'payment.success';

            if (isDeposit && payload.data) {
                const data = payload.data;

                // VTStack sends 'virtualAccount' field (not 'accountNumber' at top level)
                const accountNumber = data.virtualAccount || data.accountNumber || data.customer?.accountNumber;
                const amount        = data.amount;
                const reference     = data.reference;
                const currency      = data.currency || 'NGN';
                const senderName    = data.customer?.name || data.customer || 'Customer';

                console.log(`📥 Deposit: account=${accountNumber}, amount=${amount}, ref=${reference}`);

                if (!accountNumber) {
                    console.warn('⚠️ Webhook received but no account number found in payload');
                    return res.status(200).json({ status: 'ignored', message: 'No account number in payload' });
                }

                // Find the virtual account locally
                const virtualAccount = await VirtualAccount.findOne({ accountNumber, provider: 'vtstack' });

                if (!virtualAccount) {
                    console.warn(`⚠️ Webhook received for unknown account: ${accountNumber}`);
                    return res.status(200).json({ status: 'ignored', message: 'Account not found' });
                }

                // Check if transaction already processed (idempotency)
                const existingTxn = await Transaction.findOne({ reference_number: reference });
                if (existingTxn) {
                    console.log('🔁 Transaction already processed:', reference);
                    return res.status(200).json({ status: 'success', message: 'Already processed' });
                }

                // Find wallet
                const wallet = await Wallet.findOne({ user_id: virtualAccount.user });
                if (!wallet) {
                    console.error(`❌ Wallet not found for user: ${virtualAccount.user}`);
                    return res.status(200).json({ status: 'error', message: 'Wallet not found' });
                }

                // VTStack sends amount in kobo (e.g. 9900 kobo = ₦99)
                const amountInNaira = parseFloat(amount) / 100;

                try {
                    // Record Transaction FIRST to ensure idempotency via unique reference_number index
                    const transaction = await Transaction.create({
                        user_id: virtualAccount.user,
                        wallet_id: wallet._id,
                        type: 'wallet_topup',
                        amount: amountInNaira,
                        fee: 0,
                        total_charged: 0,
                        status: 'successful',
                        reference_number: reference,
                        payment_method: 'vtstack_transfer',
                        description: `Bank transfer from ${senderName}`,
                        metadata: { currency, raw_payload: data }
                    });

                    // Credit wallet ONLY AFTER transaction record is successfully created
                    await WalletService.creditWallet(virtualAccount.user as unknown as Types.ObjectId, amountInNaira);
                    
                    console.log(`✅ Wallet funded: user=${virtualAccount.user}, amount=₦${amountInNaira}, ref=${reference}`);
                } catch (error: any) {
                    if (error.code === 11000) {
                        console.log('🔁 Transaction already processed (race condition caught):', reference);
                        return res.status(200).json({ status: 'success', message: 'Already processed' });
                    }
                    throw error;
                }
            } else {
                console.log(`ℹ️ Unhandled VTStack event type: ${payload.event}`);
            }

            return res.status(200).json({ success: true });

        } catch (error: any) {
            console.error('❌ VTStack Webhook Error:', error);
            return res.status(500).json({ success: false, error: error.message });
        }
    }
}
