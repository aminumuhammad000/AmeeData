// controllers/admin.controller.ts
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { config } from '../config/bootstrap.js';
import { AdminRole, AdminUser, AuditLog, Plan, Transaction, User } from '../models/index.js';
import { AdminService } from '../services/admin.service.js';
import { ApiResponse } from '../utils/response.js';
export class AdminController {
    static async login(req, res) {
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
            const token = jwt.sign({ id: admin._id, role: 'admin' }, config.jwtSecret, { expiresIn: config.jwtExpiry });
            console.log('Admin login successful');
            return ApiResponse.success(res, { admin, token }, 'Login successful');
        }
        catch (error) {
            console.error('Admin login error:', error);
            return ApiResponse.error(res, error.message, 500);
        }
    }
    static async getDashboardStats(req, res) {
        try {
            const totalUsers = await User.countDocuments();
            const activeUsers = await User.countDocuments({ status: 'active' });
            const totalTransactions = await Transaction.countDocuments();
            const successfulTransactions = await Transaction.countDocuments({ status: 'successful' });
            // Calculate total data sales (sum of successful data transactions)
            const dataSalesResult = await Transaction.aggregate([
                {
                    $match: {
                        type: 'data',
                        status: 'successful'
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
            // Calculate total airtime sales (sum of successful airtime transactions)
            const airtimeSalesResult = await Transaction.aggregate([
                {
                    $match: {
                        type: 'airtime',
                        status: 'successful'
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
            const stats = {
                totalUsers,
                activeUsers,
                totalTransactions,
                successfulTransactions,
                totalDataSales,
                totalAirtimeSales
            };
            return ApiResponse.success(res, stats, 'Dashboard stats retrieved successfully');
        }
        catch (error) {
            return ApiResponse.error(res, error.message, 500);
        }
    }
    static async updateUserStatus(req, res) {
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
                admin_id: req.user?.id,
                action: 'user_status_updated',
                entity_type: 'User',
                entity_id: user._id,
                old_value: { status: oldStatus },
                new_value: { status },
                ip_address: req.ip
            });
            return ApiResponse.success(res, user, 'User status updated successfully');
        }
        catch (error) {
            return ApiResponse.error(res, error.message, 500);
        }
    }
    static async getAuditLogs(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
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
        }
        catch (error) {
            return ApiResponse.error(res, error.message, 500);
        }
    }
    static async getAllUsers(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;
            const search = req.query.search;
            const query = {};
            if (search) {
                const searchRegex = new RegExp(search, 'i');
                query.$or = [
                    { first_name: searchRegex },
                    { last_name: searchRegex },
                    { email: searchRegex },
                    { phone_number: searchRegex }
                ];
            }
            const users = await User.find(query)
                .select('-password_hash')
                .skip(skip)
                .limit(limit)
                .sort({ created_at: -1 });
            const total = await User.countDocuments(query);
            return ApiResponse.paginated(res, users, {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }, 'Users retrieved successfully');
        }
        catch (error) {
            return ApiResponse.error(res, error.message, 500);
        }
    }
    static async getUserById(req, res) {
        try {
            const user = await User.findById(req.params.id).select('-password_hash');
            if (!user) {
                return ApiResponse.error(res, 'User not found', 404);
            }
            return ApiResponse.success(res, user, 'User retrieved successfully');
        }
        catch (error) {
            return ApiResponse.error(res, error.message, 500);
        }
    }
    static async updateUser(req, res) {
        try {
            const allowedUpdates = ['first_name', 'last_name', 'email', 'phone_number', 'status', 'kyc_status'];
            const updates = Object.keys(req.body)
                .filter(key => allowedUpdates.includes(key))
                .reduce((obj, key) => {
                obj[key] = req.body[key];
                return obj;
            }, {});
            const user = await User.findByIdAndUpdate(req.params.id, { ...updates, updated_at: new Date() }, { new: true }).select('-password_hash');
            if (!user) {
                return ApiResponse.error(res, 'User not found', 404);
            }
            return ApiResponse.success(res, user, 'User updated successfully');
        }
        catch (error) {
            return ApiResponse.error(res, error.message, 500);
        }
    }
    static async deleteUser(req, res) {
        try {
            const user = await User.findByIdAndDelete(req.params.id);
            if (!user) {
                return ApiResponse.error(res, 'User not found', 404);
            }
            return ApiResponse.success(res, null, 'User deleted successfully');
        }
        catch (error) {
            return ApiResponse.error(res, error.message, 500);
        }
    }
    static async deleteAuditLog(req, res) {
        try {
            const log = await AuditLog.findByIdAndDelete(req.params.id);
            if (!log) {
                return ApiResponse.error(res, 'Audit log not found', 404);
            }
            return ApiResponse.success(res, null, 'Audit log deleted successfully');
        }
        catch (error) {
            return ApiResponse.error(res, error.message, 500);
        }
    }
    /**
     * Manually credit user wallet (for testing/admin purposes)
     */
    static async creditUserWallet(req, res) {
        try {
            const { userId, amount, description } = req.body;
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
            await WalletService.credit(userId, parseFloat(amount), description || 'Admin manual credit');
            // Get updated wallet
            const walletAfter = await WalletService.getWalletByUserId(userId);
            // Log action
            await AdminService.logAction({
                admin_id: req.user?.id,
                action: 'wallet_credited',
                entity_type: 'Wallet',
                entity_id: walletBefore._id,
                old_value: { balance: oldBalance },
                new_value: { balance: walletAfter?.balance },
                ip_address: req.ip
            });
            return ApiResponse.success(res, { wallet: walletAfter }, 'Wallet credited successfully');
        }
        catch (error) {
            return ApiResponse.error(res, error.message, 500);
        }
    }
    /**
     * Create a new admin user
     * @route POST /api/admin/admins
     * @access Private - Super Admin only
     */
    static async createAdminUser(req, res) {
        try {
            const { email, first_name, last_name, password } = req.body;
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
            // Create new admin
            const newAdmin = await AdminUser.create({
                email: email.toLowerCase(),
                password_hash,
                first_name,
                last_name,
                status: 'active',
            });
            // Log action
            await AdminService.logAction({
                admin_id: req.user?.id,
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
        }
        catch (error) {
            console.error('Error creating admin:', error);
            return ApiResponse.error(res, error.message || 'Error creating admin user', 500);
        }
    }
    /**
     * Get all admin users
     * @route GET /api/admin/admins
     * @access Private - Super Admin only
     */
    static async getAllAdmins(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
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
        }
        catch (error) {
            console.error('Error fetching admins:', error);
            return ApiResponse.error(res, error.message || 'Error fetching admin users', 500);
        }
    }
    /**
     * Get all admin roles
     * @route GET /api/admin/roles
     * @access Private - Super Admin only
     */
    static async getRoles(req, res) {
        try {
            const roles = await AdminRole.find({ status: 'active' });
            return ApiResponse.success(res, roles, 'Roles retrieved successfully');
        }
        catch (error) {
            return ApiResponse.error(res, error.message, 500);
        }
    }
    /**
     * Update current admin profile (first_name, last_name, email)
     * @route PUT /api/admin/profile
     */
    static async updateAdminProfile(req, res) {
        try {
            const allowed = ['first_name', 'last_name', 'email'];
            const updates = Object.keys(req.body)
                .filter((k) => allowed.includes(k))
                .reduce((acc, k) => {
                acc[k] = req.body[k];
                return acc;
            }, {});
            const admin = await AdminUser.findByIdAndUpdate(req.user?.id, { ...updates, updated_at: new Date() }, { new: true }).select('-password_hash');
            if (!admin)
                return ApiResponse.error(res, 'Admin not found', 404);
            return ApiResponse.success(res, admin, 'Profile updated successfully');
        }
        catch (error) {
            return ApiResponse.error(res, error.message, 500);
        }
    }
    /**
     * Change current admin password
     * @route PUT /api/admin/profile/password
     */
    static async changeAdminPassword(req, res) {
        try {
            const { currentPassword, newPassword } = req.body;
            if (!currentPassword || !newPassword) {
                return ApiResponse.error(res, 'currentPassword and newPassword are required', 400);
            }
            const admin = await AdminUser.findById(req.user?.id);
            if (!admin)
                return ApiResponse.error(res, 'Admin not found', 404);
            const ok = await bcrypt.compare(currentPassword, admin.password_hash);
            if (!ok)
                return ApiResponse.error(res, 'Current password is incorrect', 400);
            admin.password_hash = await bcrypt.hash(newPassword, 10);
            admin.updated_at = new Date();
            await admin.save();
            return ApiResponse.success(res, null, 'Password changed successfully');
        }
        catch (error) {
            return ApiResponse.error(res, error.message, 500);
        }
    }
    /**
     * Generate API key for a user
     * @route POST /api/admin/users/:id/api-key
     */
    static async generateApiKey(req, res) {
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
                admin_id: req.user?.id,
                action: 'api_key_generated',
                entity_type: 'User',
                entity_id: user._id,
                new_value: { api_key_enabled: true },
                ip_address: req.ip
            });
            return ApiResponse.success(res, { apiKey }, 'API key generated successfully');
        }
        catch (error) {
            return ApiResponse.error(res, error.message, 500);
        }
    }
    /**
     * Revoke API key for a user
     * @route DELETE /api/admin/users/:id/api-key
     */
    static async revokeApiKey(req, res) {
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
                admin_id: req.user?.id,
                action: 'api_key_revoked',
                entity_type: 'User',
                entity_id: user._id,
                new_value: { api_key_enabled: false },
                ip_address: req.ip
            });
            return ApiResponse.success(res, null, 'API key revoked successfully');
        }
        catch (error) {
            return ApiResponse.error(res, error.message, 500);
        }
    }
    /**
     * Get all plans with operator info
     * @route GET /api/admin/plans
     */
    static async getPlans(req, res) {
        try {
            const plans = await Plan.find().populate('operator_id');
            return ApiResponse.success(res, plans, 'Plans retrieved successfully');
        }
        catch (error) {
            return ApiResponse.error(res, error.message, 500);
        }
    }
    /**
     * Update developer price for a plan
     * @route PUT /api/admin/plans/:id/developer-price
     */
    static async updatePlanDeveloperPrice(req, res) {
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
                admin_id: req.user?.id,
                action: 'plan_developer_price_updated',
                entity_type: 'Plan',
                entity_id: plan._id,
                old_value: { developer_price: oldPrice },
                new_value: { developer_price },
                ip_address: req.ip
            });
            return ApiResponse.success(res, plan, 'Developer price updated successfully');
        }
        catch (error) {
            return ApiResponse.error(res, error.message, 500);
        }
    }
}
