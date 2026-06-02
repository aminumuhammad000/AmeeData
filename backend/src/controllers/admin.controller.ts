// controllers/admin.controller.ts
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { Request, Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config/bootstrap.js';
import { AdminRole, AdminUser, AuditLog, Plan, Transaction, User, Wallet } from '../models/index.js';
import VirtualAccount from '../models/VirtualAccount.js';
import { AdminService } from '../services/admin.service.js';
import { AuthRequest } from '../types/index.js';
import { ApiResponse } from '../utils/response.js';

export class AdminController {
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      console.log('Admin login attempt:', { email });

      const admin = await AdminUser.findOne({ email }).populate('role_id');
      console.log('Admin found:', admin ? 'Yes' : 'No');

      if (!admin) {
        console.log('Admin not found in database');
        return ApiResponse.error(res, 'Invalid credentials', 401);
      }

      console.log('Comparing passwords...');
      const isPasswordValid = await bcrypt.compare(password, admin.password_hash);
      console.log('Password valid:', isPasswordValid);

      if (!isPasswordValid) {
        console.log('Password mismatch');
        return ApiResponse.error(res, 'Invalid credentials', 401);
      }

      if (admin.status !== 'active') {
        console.log('Admin account inactive');
        return ApiResponse.error(res, 'Account is inactive', 403);
      }

      admin.last_login_at = new Date();
      await admin.save();

      const token = jwt.sign(
        { id: admin._id, role: 'admin', adminType: admin.type },
        config.jwtSecret as string,
        { expiresIn: config.jwtExpiry } as SignOptions
      );

      console.log('Admin login successful');
      return ApiResponse.success(res, { admin, token }, 'Login successful');
    } catch (error: any) {
      console.error('Admin login error:', error);
      return ApiResponse.error(res, error.message, 500);
    }
  }

  static async getDashboardStats(req: AuthRequest, res: Response) {
    try {
      const totalUsers = await User.countDocuments();
      const activeUsers = await User.countDocuments({ status: 'active' });
      const totalTransactions = await Transaction.countDocuments();
      const successfulTransactions = await Transaction.countDocuments({ status: 'successful' });

      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      // Calculate total data sales (sum of successful data transactions this month)
      const dataSalesResult = await Transaction.aggregate([
        {
          $match: {
            type: 'data_purchase',
            status: 'successful',
            created_at: { $gte: startOfMonth }
          }
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$amount' }
          }
        }
      ]);
      const totalDataSales = dataSalesResult.length > 0 ? dataSalesResult[0].totalAmount : 0;

      // Calculate total airtime sales (sum of successful airtime transactions this month)
      const airtimeSalesResult = await Transaction.aggregate([
        {
          $match: {
            type: 'airtime_topup',
            status: 'successful',
            created_at: { $gte: startOfMonth }
          }
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$amount' }
          }
        }
      ]);
      const totalAirtimeSales = airtimeSalesResult.length > 0 ? airtimeSalesResult[0].totalAmount : 0;

      // Daily transaction count (successful transactions today)
      const dailyTransactions = await Transaction.countDocuments({
        status: 'successful',
        created_at: { $gte: startOfDay }
      });

      // Helper aggregate: sum profit from AirtimePlan for successful transactions in a date range
      const profitPipeline = (dateFilter: Date) => [
        {
          $match: {
            type: { $in: ['data_purchase', 'airtime_topup'] },
            status: 'successful',
            created_at: { $gte: dateFilter }
          }
        },
        {
          $lookup: {
            from: 'airtimeplans',
            localField: 'plan_id',
            foreignField: '_id',
            as: 'plan'
          }
        },
        { $unwind: { path: '$plan', preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: null,
            totalProfit: { $sum: { $ifNull: ['$plan.profit', 0] } }
          }
        }
      ];

      const [dailyProfitResult, monthlyProfitResult] = await Promise.all([
        Transaction.aggregate(profitPipeline(startOfDay) as any),
        Transaction.aggregate(profitPipeline(startOfMonth) as any),
      ]);

      const dailyProfit = dailyProfitResult.length > 0 ? dailyProfitResult[0].totalProfit : 0;
      const monthlyProfit = monthlyProfitResult.length > 0 ? monthlyProfitResult[0].totalProfit : 0;

      const stats = {
        totalUsers,
        activeUsers,
        totalTransactions,
        successfulTransactions,
        totalDataSales,
        totalAirtimeSales,
        dailyTransactions,
        dailyProfit,
        monthlyProfit,
      };

      return ApiResponse.success(res, stats, 'Dashboard stats retrieved successfully');
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 500);
    }
  }

  static async updateUserStatus(req: AuthRequest, res: Response) {
    try {
      const { status } = req.body;
      const user = await User.findById(req.params.id);

      if (!user) {
        return ApiResponse.error(res, 'User not found', 404);
      }

      const oldStatus = user.status;
      user.status = status;
      user.updated_at = new Date();
      await user.save();

      // Log action
      await AdminService.logAction({
        admin_id: req.user?.id as any,
        action: 'user_status_updated',
        entity_type: 'User',
        entity_id: user._id,
        old_value: { status: oldStatus },
        new_value: { status },
        ip_address: req.ip
      });

      return ApiResponse.success(res, user, 'User status updated successfully');
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 500);
    }
  }

  static async getAuditLogs(req: AuthRequest, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const logs = await AuditLog.find()
        .populate('admin_id', 'first_name last_name email')
        .populate('user_id', 'first_name last_name email')
        .skip(skip)
        .limit(limit)
        .sort({ timestamp: -1 });

      const total = await AuditLog.countDocuments();

      return ApiResponse.paginated(res, logs, {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }, 'Audit logs retrieved successfully');
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 500);
    }
  }

  static async getAllUsers(req: AuthRequest, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const search = req.query.search as string;
      const status = req.query.status as string;
      const kyc_status = req.query.kyc_status as string;
      const sort = req.query.sort as string; // 'balance_desc', 'balance_asc', 'newest'

      const matchStage: any = {};
      if (search) {
        const searchRegex = new RegExp(search, 'i');
        matchStage.$or = [
          { first_name: searchRegex },
          { last_name: searchRegex },
          { email: searchRegex },
          { phone_number: searchRegex }
        ];
      }
      if (status) matchStage.status = status;
      if (kyc_status) matchStage.kyc_status = kyc_status;

      // Pipeline for data
      const dataPipeline: any[] = [
        { $match: matchStage },
        {
          $lookup: {
            from: 'wallets',
            localField: '_id',
            foreignField: 'user_id',
            as: 'wallet'
          }
        },
        { $unwind: { path: '$wallet', preserveNullAndEmptyArrays: true } },
        {
          $addFields: {
            balance: { $ifNull: ['$wallet.balance', 0] }
          }
        }
      ];

      // Sort
      if (sort === 'balance_desc') {
        dataPipeline.push({ $sort: { balance: -1, created_at: -1 } });
      } else if (sort === 'balance_asc') {
        dataPipeline.push({ $sort: { balance: 1, created_at: -1 } });
      } else {
        dataPipeline.push({ $sort: { created_at: -1 } });
      }

      // Pagination
      dataPipeline.push({ $skip: skip });
      dataPipeline.push({ $limit: limit });
      dataPipeline.push({ $project: { password_hash: 0, wallet: 0 } });

      const users = await User.aggregate(dataPipeline);
      const total = await User.countDocuments(matchStage);

      return ApiResponse.paginated(res, users, {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }, 'Users retrieved successfully');
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 500);
    }
  }


  static async getUserById(req: AuthRequest, res: Response) {
    try {
      let user = await User.findById(req.params.id).select('-password_hash').lean();
      if (!user) {
        return ApiResponse.error(res, 'User not found', 404);
      }

      const wallet = await Wallet.findOne({ user_id: user._id });
      user = {
        ...user,
        balance: wallet ? wallet.balance : 0
      } as any;

      return ApiResponse.success(res, user, 'User retrieved successfully');
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 500);
    }
  }

  static async updateUser(req: AuthRequest, res: Response) {
    try {
      const allowedUpdates = ['first_name', 'last_name', 'email', 'phone_number', 'status', 'kyc_status'];
      const updates = Object.keys(req.body)
        .filter(key => allowedUpdates.includes(key))
        .reduce((obj: any, key) => {
          obj[key] = req.body[key];
          return obj;
        }, {});

      const user = await User.findByIdAndUpdate(
        req.params.id,
        { ...updates, updated_at: new Date() },
        { new: true }
      ).select('-password_hash');

      if (!user) {
        return ApiResponse.error(res, 'User not found', 404);
      }

      return ApiResponse.success(res, user, 'User updated successfully');
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 500);
    }
  }

  static async deleteUser(req: AuthRequest, res: Response) {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) {
        return ApiResponse.error(res, 'User not found', 404);
      }

      return ApiResponse.success(res, null, 'User deleted successfully');
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 500);
    }
  }

  static async deleteAuditLog(req: AuthRequest, res: Response) {
    try {
      const log = await AuditLog.findByIdAndDelete(req.params.id);
      if (!log) {
        return ApiResponse.error(res, 'Audit log not found', 404);
      }

      return ApiResponse.success(res, null, 'Audit log deleted successfully');
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 500);
    }
  }

  /**
   * Manually credit user wallet (for testing/admin purposes)
   */
  static async creditUserWallet(req: AuthRequest, res: Response) {
    try {
      const { userId, amount, description } = req.body;

      // Check if current admin is super-admin
      if (req.user?.adminType !== 'super-admin') {
        return ApiResponse.error(res, 'Only super-admins can credit wallets', 403);
      }

      if (!userId || !amount) {
        return ApiResponse.error(res, 'User ID and amount are required', 400);
      }

      const user = await User.findById(userId);
      if (!user) {
        return ApiResponse.error(res, 'User not found', 404);
      }

      // Import WalletService
      const { WalletService } = await import('../services/wallet.service.js');

      // Get wallet before credit
      const walletBefore = await WalletService.getWalletByUserId(userId);
      if (!walletBefore) {
        return ApiResponse.error(res, 'Wallet not found', 404);
      }
      const oldBalance = walletBefore.balance;

      // Credit wallet
      await WalletService.credit(
        userId,
        parseFloat(amount),
        description || 'Admin manual credit'
      );

      // Get updated wallet
      const walletAfter = await WalletService.getWalletByUserId(userId);

      // Log action
      await AdminService.logAction({
        admin_id: req.user?.id as any,
        action: 'wallet_credited',
        entity_type: 'Wallet',
        entity_id: walletBefore._id,
        old_value: { balance: oldBalance },
        new_value: { balance: walletAfter?.balance },
        ip_address: req.ip
      });

      return ApiResponse.success(res, { wallet: walletAfter }, 'Wallet credited successfully');
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 500);
    }
  }
  
  /**
   * Bulk credit user wallets
   */
  static async bulkCreditWallets(req: AuthRequest, res: Response) {
    try {
      const { userIds, amount, description } = req.body;

      // Check if current admin is super-admin
      if (req.user?.adminType !== 'super-admin') {
        return ApiResponse.error(res, 'Only super-admins can credit wallets', 403);
      }

      if (!userIds || !Array.isArray(userIds) || userIds.length === 0 || !amount) {
        return ApiResponse.error(res, 'User IDs and amount are required', 400);
      }

      // Import WalletService
      const { WalletService } = await import('../services/wallet.service.js');

      const results = [];
      const errors = [];

      for (const userId of userIds) {
        try {
          const user = await User.findById(userId);
          if (!user) {
            errors.push({ userId, error: 'User not found' });
            continue;
          }

          const walletBefore = await WalletService.getWalletByUserId(userId);
          if (!walletBefore) {
            errors.push({ userId, error: 'Wallet not found' });
            continue;
          }
          const oldBalance = walletBefore.balance;

          await WalletService.credit(
            userId,
            parseFloat(amount),
            description || 'Admin bulk manual credit'
          );

          const walletAfter = await WalletService.getWalletByUserId(userId);

          // Log action
          await AdminService.logAction({
            admin_id: req.user?.id as any,
            action: 'wallet_credited_bulk',
            entity_type: 'Wallet',
            entity_id: walletBefore._id,
            old_value: { balance: oldBalance },
            new_value: { balance: walletAfter?.balance },
            ip_address: req.ip
          });

          results.push({ userId, status: 'success', newBalance: walletAfter?.balance });
        } catch (err: any) {
          errors.push({ userId, error: err.message });
        }
      }

      return ApiResponse.success(res, { results, errors }, `Processed bulk credit for ${userIds.length} users`);
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 500);
    }
  /**
   * Broadcast wallet credit to all users
   */
  static async broadcastWalletCredit(req: AuthRequest, res: Response) {
    try {
      const { amount, description } = req.body;

      // Check if current admin is super-admin
      if (req.user?.adminType !== 'super-admin') {
        return ApiResponse.error(res, 'Only super-admins can send broadcast credits', 403);
      }

      if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
        return ApiResponse.error(res, 'A valid positive amount is required', 400);
      }

      const users = await User.find({ status: 'active' });
      
      if (users.length === 0) {
        return ApiResponse.success(res, { successCount: 0 }, 'No active users to credit');
      }

      const { WalletService } = await import('../services/wallet.service.js');
      
      const referenceBase = `BROADCAST_${Date.now()}`;
      let successCount = 0;

      // Process in small batches to avoid overwhelming the database
      const batchSize = 50;
      for (let i = 0; i < users.length; i += batchSize) {
        const batch = users.slice(i, i + batchSize);
        await Promise.all(batch.map(async (user) => {
          try {
            const wallet = await Wallet.findOne({ user_id: user._id });
            if (!wallet) return;

            const reference = `${referenceBase}_${user._id}`;
            
            // Create transaction record
            await Transaction.create({
              user_id: user._id,
              wallet_id: wallet._id,
              amount: parseFloat(amount),
              type: 'wallet_topup',
              total_charged: 0,
              payment_method: 'admin_broadcast',
              status: 'successful',
              reference_number: reference,
              description: description || 'System-wide broadcast credit',
              metadata: { 
                 admin_id: req.user?.id,
                 reason: 'broadcast_credit'
              }
            });

            // Credit wallet
            await WalletService.creditWallet(user._id, parseFloat(amount));
            successCount++;
          } catch (err) {
            console.error(`Failed to credit user ${user._id}:`, err);
          }
        }));
      }

      // Log action
      await AdminService.logAction({
        admin_id: req.user?.id as any,
        action: 'wallet_credited_broadcast',
        entity_type: 'Wallet',
        new_value: { amount, description, successCount, totalUsers: users.length },
        ip_address: req.ip
      });

      return ApiResponse.success(res, { successCount }, `Broadcast credit successful for ${successCount} users`);
    } catch (error: any) {
      console.error('Broadcast credit error:', error);
      return ApiResponse.error(res, error.message, 500);
    }
  }


   * @route POST /api/admin/admins
   * @access Private - Super Admin only
   */
  static async createAdminUser(req: AuthRequest, res: Response) {
    try {
      const { email, first_name, last_name, password, type, role_id } = req.body;

      // Check if current admin is super-admin
      if (req.user?.adminType !== 'super-admin') {
        return ApiResponse.error(res, 'Only super-admins can create other admins', 403);
      }

      // Validate required fields
      if (!email || !first_name || !last_name || !password) {
        return ApiResponse.error(res, 'Email, first name, last name, and password are required', 400);
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return ApiResponse.error(res, 'Invalid email format', 400);
      }

      // Check if admin already exists
      const existingAdmin = await AdminUser.findOne({ email: email.toLowerCase() });
      if (existingAdmin) {
        return ApiResponse.error(res, 'Admin with this email already exists', 409);
      }

      // Hash password
      const password_hash = await bcrypt.hash(password, 10);

      // Handle role_id
      let finalRoleId = role_id;
      if (type === 'super-admin' && (!role_id || role_id === '')) {
         const superAdminRole = await AdminRole.findOne({ name: 'Super Admin' });
         if (superAdminRole) {
            finalRoleId = superAdminRole._id;
         }
      }

      // Create new admin
      const newAdmin = await AdminUser.create({
        email: email.toLowerCase(),
        password_hash,
        first_name,
        last_name,
        type: type || 'sub-admin',
        status: 'active',
        role_id: finalRoleId || undefined,
      });

      // Log action
      await AdminService.logAction({
        admin_id: req.user?.id as any,
        action: 'admin_created',
        entity_type: 'AdminUser',
        entity_id: newAdmin._id,
        old_value: {},
        new_value: { email, first_name, last_name },
        ip_address: req.ip
      });

      return ApiResponse.success(res, {
        _id: newAdmin._id,
        email: newAdmin.email,
        first_name: newAdmin.first_name,
        last_name: newAdmin.last_name,
        password, // Return plain password only on creation
        status: newAdmin.status,
      }, 'Admin user created successfully', 201);
    } catch (error: any) {
      console.error('Error creating admin:', error);
      return ApiResponse.error(res, error.message || 'Error creating admin user', 500);
    }
  }

  /**
   * Get all admin users
   * @route GET /api/admin/admins
   * @access Private - Super Admin only
   */
  static async getAllAdmins(req: AuthRequest, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const admins = await AdminUser.find()
        .select('-password_hash')
        .skip(skip)
        .limit(limit)
        .sort({ created_at: -1 });

      const total = await AdminUser.countDocuments();

      return ApiResponse.paginated(res, admins, {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }, 'Admin users retrieved successfully');
    } catch (error: any) {
      console.error('Error fetching admins:', error);
      return ApiResponse.error(res, error.message || 'Error fetching admin users', 500);
    }
  }

  /**
   * Get all admin roles
   * @route GET /api/admin/roles
   * @access Private - Super Admin only
   */
  static async getRoles(req: AuthRequest, res: Response) {
    try {
      const roles = await AdminRole.find({ status: 'active' });
      return ApiResponse.success(res, roles, 'Roles retrieved successfully');
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 500);
    }
  }

  /**
   * Update current admin profile (first_name, last_name, email)
   * @route PUT /api/admin/profile
   */
  static async updateAdminProfile(req: AuthRequest, res: Response) {
    try {
      const allowed = ['first_name', 'last_name', 'email'];
      const updates = Object.keys(req.body)
        .filter((k) => allowed.includes(k))
        .reduce((acc: any, k) => {
          acc[k] = req.body[k];
          return acc;
        }, {});

      const admin = await AdminUser.findByIdAndUpdate(
        req.user?.id,
        { ...updates, updated_at: new Date() },
        { new: true }
      ).select('-password_hash');

      if (!admin) return ApiResponse.error(res, 'Admin not found', 404);
      return ApiResponse.success(res, admin, 'Profile updated successfully');
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 500);
    }
  }

  /**
   * Change current admin password
   * @route PUT /api/admin/profile/password
   */
  static async changeAdminPassword(req: AuthRequest, res: Response) {
    try {
      const { currentPassword, newPassword } = req.body as { currentPassword: string; newPassword: string };
      if (!currentPassword || !newPassword) {
        return ApiResponse.error(res, 'currentPassword and newPassword are required', 400);
      }

      const admin = await AdminUser.findById(req.user?.id);
      if (!admin) return ApiResponse.error(res, 'Admin not found', 404);

      const ok = await bcrypt.compare(currentPassword, admin.password_hash);
      if (!ok) return ApiResponse.error(res, 'Current password is incorrect', 400);

      admin.password_hash = await bcrypt.hash(newPassword, 10);
      admin.updated_at = new Date();
      await admin.save();

      return ApiResponse.success(res, null, 'Password changed successfully');
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 500);
    }
  }

  /**
   * Generate API key for a user
   * @route POST /api/admin/users/:id/api-key
   */
  static async generateApiKey(req: AuthRequest, res: Response) {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return ApiResponse.error(res, 'User not found', 404);
      }

      const apiKey = `sk_live_${crypto.randomBytes(24).toString('hex')}`;
      user.api_key = apiKey;
      user.api_key_enabled = true;
      user.updated_at = new Date();
      await user.save();

      // Log action
      await AdminService.logAction({
        admin_id: req.user?.id as any,
        action: 'api_key_generated',
        entity_type: 'User',
        entity_id: user._id,
        new_value: { api_key_enabled: true },
        ip_address: req.ip
      });

      return ApiResponse.success(res, { apiKey }, 'API key generated successfully');
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 500);
    }
  }

  /**
   * Revoke API key for a user
   * @route DELETE /api/admin/users/:id/api-key
   */
  static async revokeApiKey(req: AuthRequest, res: Response) {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return ApiResponse.error(res, 'User not found', 404);
      }

      user.api_key = undefined;
      user.api_key_enabled = false;
      user.updated_at = new Date();
      await user.save();

      // Log action
      await AdminService.logAction({
        admin_id: req.user?.id as any,
        action: 'api_key_revoked',
        entity_type: 'User',
        entity_id: user._id,
        new_value: { api_key_enabled: false },
        ip_address: req.ip
      });

      return ApiResponse.success(res, null, 'API key revoked successfully');
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 500);
    }
  }

  /**
   * Get all plans with operator info
   * @route GET /api/admin/plans
   */
  static async getPlans(req: AuthRequest, res: Response) {
    try {
      const plans = await Plan.find().populate('operator_id');
      return ApiResponse.success(res, plans, 'Plans retrieved successfully');
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 500);
    }
  }

  /**
   * Update developer price for a plan
   * @route PUT /api/admin/plans/:id/developer-price
   */
  static async updatePlanDeveloperPrice(req: AuthRequest, res: Response) {
    try {
      const { developer_price } = req.body;
      const plan = await Plan.findById(req.params.id);

      if (!plan) {
        return ApiResponse.error(res, 'Plan not found', 404);
      }

      const oldPrice = plan.developer_price;
      plan.developer_price = developer_price;
      plan.updated_at = new Date();
      await plan.save();

      // Log action
      await AdminService.logAction({
        admin_id: req.user?.id as any,
        action: 'plan_developer_price_updated',
        entity_type: 'Plan',
        entity_id: plan._id,
        old_value: { developer_price: oldPrice },
        new_value: { developer_price },
        ip_address: req.ip
      });

      return ApiResponse.success(res, plan, 'Developer price updated successfully');
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 500);
    }
  }

  /**
   * Delete an admin user
   * @route DELETE /api/admin/admins/:id
   * @access Private - Super Admin only
   */
  static async deleteAdminUser(req: AuthRequest, res: Response) {
    try {
      // Check if current admin is super-admin
      if (req.user?.adminType !== 'super-admin') {
        return ApiResponse.error(res, 'Only super-admins can delete other admins', 403);
      }

      const admin = await AdminUser.findByIdAndDelete(req.params.id);
      if (!admin) {
        return ApiResponse.error(res, 'Admin user not found', 404);
      }

      // Log action
      await AdminService.logAction({
        admin_id: req.user?.id as any,
        action: 'admin_deleted',
        entity_type: 'AdminUser',
        entity_id: admin._id,
        old_value: { email: admin.email },
        ip_address: req.ip
      });

      return ApiResponse.success(res, null, 'Admin user deleted successfully');
    } catch (error: any) {
      console.error('Error deleting admin:', error);
      return ApiResponse.error(res, error.message || 'Error deleting admin user', 500);
    }
  }

  /**
   * Get users who have generated virtual account numbers
   * @route GET /api/admin/virtual-accounts
   */
  static async getVirtualAccounts(req: AuthRequest, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string;
      const skip = (page - 1) * limit;

      const query: any = {};
      if (search) {
        const searchRegex = new RegExp(search, 'i');
        query.$or = [
          { accountNumber: searchRegex },
          { accountName: searchRegex },
          { bankName: searchRegex }
        ];
      }

      const accounts = await VirtualAccount.find(query)
        .populate('user', 'first_name last_name email phone_number status created_at')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean();

      const total = await VirtualAccount.countDocuments(query);

      return ApiResponse.paginated(res, accounts, {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }, 'Virtual accounts retrieved successfully');
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 500);
    }
  }

  /**
   * Export all users as CSV
   * @route GET /api/admin/users/export
   */
  static async exportUsersCSV(req: AuthRequest, res: Response) {
    try {
      const users = await User.find().select('-password_hash').lean();

      const headers = ['ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Status', 'KYC Status', 'Referral Code', 'Joined'];
      const rows = users.map((u: any) => [
        u._id.toString(),
        u.first_name || '',
        u.last_name || '',
        u.email || '',
        u.phone_number || '',
        u.status || '',
        u.kyc_status || '',
        u.referral_code || '',
        u.created_at ? new Date(u.created_at).toISOString().split('T')[0] : ''
      ]);

      const escape = (v: string) => `"${String(v).replace(/"/g, '""')}"`;
      const csv = [headers, ...rows].map(row => row.map(escape).join(',')).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="users_${new Date().toISOString().split('T')[0]}.csv"`);
      return res.send(csv);
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 500);
    }
  }
}