import mongoose from 'mongoose';
import { Wallet, Transaction, User } from '../models/index.js';
import { WalletService } from '../services/wallet.service.js';
import { ApiResponse } from '../utils/response.js';
export class WalletController {
    static async getWallet(req, res) {
        try {
            const wallet = await Wallet.findOne({ user_id: req.user?.id });
            if (!wallet) {
                return ApiResponse.error(res, 'Wallet not found', 404);
            }
            return ApiResponse.success(res, wallet, 'Wallet retrieved successfully');
        }
        catch (error) {
            return ApiResponse.error(res, error.message, 500);
        }
    }
    static async fundWallet(req, res) {
        try {
            const { amount, payment_method } = req.body;
            if (amount <= 0) {
                return ApiResponse.error(res, 'Invalid amount', 400);
            }
            const wallet = await Wallet.findOne({ user_id: req.user?.id });
            if (!wallet) {
                return ApiResponse.error(res, 'Wallet not found', 404);
            }
            // Create transaction record
            const transaction = await Transaction.create({
                user_id: req.user?.id,
                wallet_id: wallet._id,
                type: 'wallet_topup',
                amount,
                fee: 0,
                total_charged: amount,
                status: 'pending',
                reference_number: `TXN-${Date.now()}`,
                payment_method
            });
            // Process payment (integrate with payment gateway)
            // For now, we'll simulate success
            await WalletService.creditWallet(wallet.user_id, amount, true);
            transaction.status = 'successful';
            await transaction.save();
            return ApiResponse.success(res, { transaction, wallet }, 'Wallet funded successfully');
        }
        catch (error) {
            return ApiResponse.error(res, error.message, 500);
        }
    }
    static async getWalletTransactions(req, res) {
        try {
            const wallet = await Wallet.findOne({ user_id: req.user?.id });
            if (!wallet) {
                return ApiResponse.error(res, 'Wallet not found', 404);
            }
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;
            const transactions = await Transaction.find({ wallet_id: wallet._id })
                .skip(skip)
                .limit(limit)
                .sort({ created_at: -1 });
            const total = await Transaction.countDocuments({ wallet_id: wallet._id });
            return ApiResponse.paginated(res, transactions, {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }, 'Wallet transactions retrieved successfully');
        }
        catch (error) {
            return ApiResponse.error(res, error.message, 500);
        }
    }
    static async adjustBalance(req, res) {
        try {
            const { amount, type, remarks } = req.body;
            if (!amount || !type) {
                return ApiResponse.error(res, 'Amount and type are required', 400);
            }
            const wallet = await Wallet.findOne({ user_id: req.user?.id });
            if (!wallet) {
                return ApiResponse.error(res, 'Wallet not found', 404);
            }
            if (type === 'credit') {
                await WalletService.creditWallet(wallet.user_id, amount);
            }
            else if (type === 'debit') {
                await WalletService.debitWallet(wallet.user_id, amount);
            }
            else {
                return ApiResponse.error(res, 'Invalid adjustment type', 400);
            }
            const updatedWallet = await Wallet.findOne({ user_id: req.user?.id });
            return ApiResponse.success(res, updatedWallet, 'Wallet balance adjusted successfully');
        }
        catch (error) {
            return ApiResponse.error(res, error.message, 500);
        }
    }
    static async transferFunds(req, res) {
        try {
            const { recipient_email, amount, remarks } = req.body;
            if (amount <= 0) {
                return ApiResponse.error(res, 'Invalid amount', 400);
            }
            const senderWallet = await Wallet.findOne({ user_id: req.user?.id });
            if (!senderWallet) {
                return ApiResponse.error(res, 'Sender wallet not found', 404);
            }
            if (senderWallet.balance < amount) {
                return ApiResponse.error(res, 'Insufficient balance', 400);
            }
            await WalletService.debitWallet(senderWallet.user_id, amount);
            return ApiResponse.success(res, null, 'Transfer initiated successfully');
        }
        catch (error) {
            return ApiResponse.error(res, error.message, 500);
        }
    }
    static async transferCareBalance(req, res) {
        try {
            const { recipient_phone, amount, message } = req.body;
            if (amount <= 0) {
                return ApiResponse.error(res, 'Invalid amount', 400);
            }
            // Find recipient
            const cleanPhone = recipient_phone.replace(/\D/g, '');
            const recipient = await User.findOne({
                $or: [
                    { phone_number: recipient_phone },
                    { phone_number: cleanPhone }
                ]
            });
            if (!recipient) {
                return ApiResponse.error(res, 'Recipient not found', 404);
            }
            if (recipient._id.toString() === req.user?.id) {
                return ApiResponse.error(res, 'Cannot send care to yourself', 400);
            }
            const senderWallet = await Wallet.findOne({ user_id: req.user?.id });
            if (!senderWallet) {
                return ApiResponse.error(res, 'Sender wallet not found', 404);
            }
            if (senderWallet.balance < amount) {
                return ApiResponse.error(res, 'Insufficient main balance', 400);
            }
            let session;
            try {
                session = await mongoose.startSession();
                session.startTransaction();
            }
            catch (e) {
                console.warn('⚠️ Mongoose sessions not supported (standalone MongoDB). Falling back to sequential operations.');
                session = null;
            }
            try {
                // Debit sender main balance
                await WalletService.debitWallet(senderWallet.user_id, amount, session);
                // Credit recipient main balance (unified wallet)
                await WalletService.creditWallet(recipient._id, amount, false, session);
                // Create transaction record for sender
                await Transaction.create([{
                        user_id: req.user?.id,
                        wallet_id: senderWallet._id,
                        type: 'transfer',
                        amount,
                        fee: 0,
                        total_charged: amount,
                        status: 'successful',
                        reference_number: `CARE-S-${Date.now()}`,
                        description: message || `Care sent to ${recipient_phone}`,
                        payment_method: 'wallet'
                    }], { session });
                // Create transaction record for recipient
                const recipientWallet = await Wallet.findOne({ user_id: recipient._id }).session(session);
                if (recipientWallet) {
                    const sender = await User.findById(req.user?.id).session(session);
                    await Transaction.create([{
                            user_id: recipient._id,
                            wallet_id: recipientWallet._id,
                            type: 'transfer_received',
                            amount,
                            fee: 0,
                            total_charged: amount,
                            status: 'successful',
                            reference_number: `CARE-R-${Date.now()}`,
                            description: message || `Care received from ${sender?.phone_number || 'AmeeData User'}`,
                            payment_method: 'wallet'
                        }], { session });
                }
                if (session) {
                    await session.commitTransaction();
                    session.endSession();
                }
                return ApiResponse.success(res, null, 'Care transferred successfully');
            }
            catch (error) {
                if (session) {
                    await session.abortTransaction();
                    session.endSession();
                }
                return ApiResponse.error(res, error.message || 'Transfer failed', 500);
            }
        }
        catch (outerError) {
            return ApiResponse.error(res, outerError.message, 500);
        }
    }
}
