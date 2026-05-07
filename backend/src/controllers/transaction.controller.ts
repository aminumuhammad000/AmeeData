// controllers/transaction.controller.ts
import { Response } from 'express';
import { Transaction, Wallet, Operator, Plan } from '../models/index.js';
import { WalletService } from '../services/wallet.service.js';
import { NotificationService } from '../services/notification.service.js';
import { ApiResponse } from '../utils/response.js';
import { AuthRequest } from '../types/index.js';
import { transactionValidation } from '../utils/validators.js';

export class TransactionController {
  static async createTransaction(req: AuthRequest, res: Response) {
    try {
      const { error } = transactionValidation.create.validate(req.body);
      if (error) {
        return ApiResponse.error(res, error.details[0].message, 400);
      }

      const { type, amount, destination_account, operator_id, plan_id, payment_method } = req.body;

      const wallet = await Wallet.findOne({ user_id: req.user?.id });
      if (!wallet) {
        return ApiResponse.error(res, 'Wallet not found', 404);
      }

      const fee = amount * 0.01; // 1% fee
      const total_charged = amount + fee;

      if (wallet.balance < total_charged) {
        return ApiResponse.error(res, 'Insufficient balance', 400);
      }

      const transaction = await Transaction.create({
        user_id: req.user?.id,
        wallet_id: wallet._id,
        type,
        amount,
        fee,
        total_charged,
        status: 'pending',
        reference_number: `TXN-${Date.now()}`,
        payment_method,
        destination_account,
        operator_id,
        plan_id
      });

      // Debit wallet
      await WalletService.debitWallet(wallet.user_id, total_charged);

      // Process transaction based on type
      // This is where you'd integrate with VTU providers
      transaction.status = 'successful';
      await transaction.save();

      // Send notification
      await NotificationService.sendTransactionNotification(wallet.user_id, transaction);

      return ApiResponse.success(res, transaction, 'Transaction created successfully', 201);
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 500);
    }
  }

  static async getTransactions(req: AuthRequest, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const transactions = await Transaction.find({ user_id: req.user?.id })
        .populate('operator_id')
        .populate('plan_id')
        .skip(skip)
        .limit(limit)
        .sort({ created_at: -1 });

      const total = await Transaction.countDocuments({ user_id: req.user?.id });

      return ApiResponse.paginated(res, transactions, {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }, 'Transactions retrieved successfully');
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 500);
    }
  }

  static async getTransactionById(req: AuthRequest, res: Response) {
    try {
      const transaction = await Transaction.findOne({
        _id: req.params.id,
        user_id: req.user?.id
      }).populate('operator_id').populate('plan_id');

      if (!transaction) {
        return ApiResponse.error(res, 'Transaction not found', 404);
      }

      return ApiResponse.success(res, transaction, 'Transaction retrieved successfully');
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 500);
    }
  }

  static async getAllTransactions(req: AuthRequest, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const filter: any = {};
      if (req.query.status) filter.status = req.query.status;
      if (req.query.type) filter.type = req.query.type;

      const transactions = await Transaction.find(filter)
        .populate('user_id', 'first_name last_name email')
        .populate('operator_id')
        .populate('plan_id')
        .skip(skip)
        .limit(limit)
        .sort({ created_at: -1 });

      const total = await Transaction.countDocuments(filter);

      return ApiResponse.paginated(res, transactions, {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }, 'Transactions retrieved successfully');
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 500);
    }
  }

  static async updateTransactionStatus(req: AuthRequest, res: Response) {
    try {
      const { status, remarks } = req.body;
      const allowedStatuses = ['pending', 'successful', 'failed', 'refunded'];

      if (!allowedStatuses.includes(status)) {
        return ApiResponse.error(res, 'Invalid status', 400);
      }

      const transaction = await Transaction.findByIdAndUpdate(
        req.params.id,
        { 
          status, 
          remarks: remarks || '',
          updated_at: new Date() 
        },
        { new: true }
      );

      if (!transaction) {
        return ApiResponse.error(res, 'Transaction not found', 404);
      }

      return ApiResponse.success(res, transaction, 'Transaction status updated successfully');
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 500);
    }
  }
}