// controllers/transaction.controller.ts
import { Response } from 'express';
import { Transaction, Wallet, Operator, Plan } from '../models/index.js';
import { WalletService } from '../services/wallet.service.js';
import { NotificationService } from '../services/notification.service.js';
import { ApiResponse } from '../utils/response.js';
import { AuthRequest } from '../types/index.js';
import { transactionValidation } from '../utils/validators.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';

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
        .populate('related_user_id', 'first_name last_name phone_number profile_picture')
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
      if (req.query.search) {
        const { Types } = await import('mongoose');
        const searchRegex = new RegExp(req.query.search as string, 'i');
        filter.$or = [
          { reference_number: searchRegex },
          { description: searchRegex },
        ];
      }

      const { AirtimePlan } = await import('../models/airtime_plan.model.js');

      const transactions = await Transaction.find(filter)
        .populate('user_id', 'first_name last_name email phone_number')
        .populate('operator_id')
        .populate('plan_id')
        .skip(skip)
        .limit(limit)
        .sort({ created_at: -1 })
        .lean();

      // Attach plan_name: try plan_id.name (Plan model), then look up AirtimePlan
      const enriched = await Promise.all(transactions.map(async (txn: any) => {
        let plan_name: string | null = null;

        // 1. Already populated via Plan model
        if (txn.plan_id && typeof txn.plan_id === 'object' && txn.plan_id.name) {
          plan_name = txn.plan_id.name;
        }

        // 2. If not found, try AirtimePlan lookup
        if (!plan_name && txn.plan_id) {
          const planId = typeof txn.plan_id === 'object' ? txn.plan_id._id : txn.plan_id;
          const airtimePlan = await AirtimePlan.findById(planId).lean() as any;
          if (airtimePlan) plan_name = airtimePlan.name;
        }

        // 3. Fall back to metadata or description
        if (!plan_name && txn.metadata?.plan_name) plan_name = txn.metadata.plan_name;
        if (!plan_name && txn.metadata?.planName) plan_name = txn.metadata.planName;

        return { ...txn, plan_name };
      }));

      const total = await Transaction.countDocuments(filter);

      return ApiResponse.paginated(res, enriched, {
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

  static async uploadReceipt(req: AuthRequest, res: Response) {
    try {
      const { base64Image } = req.body;
      if (!base64Image) {
        return ApiResponse.error(res, 'Base64 image is required', 400);
      }

      const transaction = await Transaction.findOne({
        _id: req.params.id,
        user_id: req.user?.id
      });

      if (!transaction) {
        return ApiResponse.error(res, 'Transaction not found', 404);
      }

      const receiptUrl = await uploadToCloudinary(`data:image/png;base64,${base64Image}`, 'receipts');
      
      transaction.receipt_url = receiptUrl;
      await transaction.save();

      return ApiResponse.success(res, { receipt_url: receiptUrl }, 'Receipt uploaded successfully');
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 500);
    }
  }
}