// controllers/wallet.controller.ts
import { Response } from 'express';
import { Wallet, Transaction } from '../models/index.js';
import { WalletService } from '../services/wallet.service.js';
import { ApiResponse } from '../utils/response.js';
import { AuthRequest } from '../types/index.js';

export class WalletController {
  static async getWallet(req: AuthRequest, res: Response) {
    try {
      const wallet = await Wallet.findOne({ user_id: req.user?.id });
      if (!wallet) {
        return ApiResponse.error(res, 'Wallet not found', 404);
      }

      return ApiResponse.success(res, wallet, 'Wallet retrieved successfully');
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 500);
    }
  }

  static async fundWallet(req: AuthRequest, res: Response) {
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
      await WalletService.creditWallet(wallet.user_id, amount);
      transaction.status = 'successful';
      await transaction.save();

      return ApiResponse.success(res, { transaction, wallet }, 'Wallet funded successfully');
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 500);
    }
  }

  static async getWalletTransactions(req: AuthRequest, res: Response) {
    try {
      const wallet = await Wallet.findOne({ user_id: req.user?.id });
      if (!wallet) {
        return ApiResponse.error(res, 'Wallet not found', 404);
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
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
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 500);
    }
  }

  static async adjustBalance(req: AuthRequest, res: Response) {
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
      } else if (type === 'debit') {
        await WalletService.debitWallet(wallet.user_id, amount);
      } else {
        return ApiResponse.error(res, 'Invalid adjustment type', 400);
      }

      const updatedWallet = await Wallet.findOne({ user_id: req.user?.id });
      return ApiResponse.success(res, updatedWallet, 'Wallet balance adjusted successfully');
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 500);
    }
  }

  static async transferFunds(req: AuthRequest, res: Response) {
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
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 500);
    }
  }
}