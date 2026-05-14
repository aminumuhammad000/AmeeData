import { ReferralSetting, Transaction, User } from '../models/index.js';
import { ApiResponse } from '../utils/response.js';
export class ReferralController {
    /**
     * Get referral stats for the authenticated user
     */
    static async getUserReferralStats(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId)
                return ApiResponse.error(res, 'Unauthorized', 401);
            const user = await User.findById(userId);
            if (!user)
                return ApiResponse.error(res, 'User not found', 404);
            const referralCount = await User.countDocuments({ referred_by: userId });
            // Calculate total earnings from referrals
            const totalEarningsResult = await Transaction.aggregate([
                {
                    $match: {
                        user_id: userId,
                        type: 'referral_bonus',
                        status: 'successful'
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: '$amount' }
                    }
                }
            ]);
            const totalEarnings = totalEarningsResult.length > 0 ? totalEarningsResult[0].total : 0;
            const referrals = await User.find({ referred_by: userId })
                .select('first_name last_name created_at status')
                .sort({ created_at: -1 });
            return ApiResponse.success(res, {
                referral_code: user.referral_code,
                referral_count: referralCount,
                total_earnings: totalEarnings,
                referrals
            }, 'Referral stats retrieved successfully');
        }
        catch (error) {
            return ApiResponse.error(res, error.message, 500);
        }
    }
    /**
     * Get referral settings (Admin and User)
     */
    static async getReferralSettings(req, res) {
        try {
            let settings = await ReferralSetting.findOne();
            if (!settings) {
                // Create default settings if they don't exist
                settings = await ReferralSetting.create({
                    referrer_bonus_amount: 500,
                    referee_bonus_amount: 0,
                    min_transaction_for_bonus: 2000,
                    is_active: true
                });
            }
            return ApiResponse.success(res, settings, 'Referral settings retrieved successfully');
        }
        catch (error) {
            return ApiResponse.error(res, error.message, 500);
        }
    }
    /**
     * Update referral settings (Admin only)
     */
    static async updateReferralSettings(req, res) {
        try {
            const { referrer_bonus_amount, referee_bonus_amount, min_transaction_for_bonus, is_active } = req.body;
            let settings = await ReferralSetting.findOne();
            if (!settings) {
                settings = new ReferralSetting();
            }
            if (referrer_bonus_amount !== undefined)
                settings.referrer_bonus_amount = referrer_bonus_amount;
            if (referee_bonus_amount !== undefined)
                settings.referee_bonus_amount = referee_bonus_amount;
            if (min_transaction_for_bonus !== undefined)
                settings.min_transaction_for_bonus = min_transaction_for_bonus;
            if (is_active !== undefined)
                settings.is_active = is_active;
            settings.updated_at = new Date();
            await settings.save();
            return ApiResponse.success(res, settings, 'Referral settings updated successfully');
        }
        catch (error) {
            return ApiResponse.error(res, error.message, 500);
        }
    }
    /**
     * Get global referral stats (Admin only)
     */
    static async getAdminReferralStats(req, res) {
        try {
            const totalReferrals = await User.countDocuments({ referred_by: { $exists: true, $ne: null } });
            const topReferrers = await User.aggregate([
                { $match: { referred_by: { $exists: true, $ne: null } } },
                { $group: { _id: '$referred_by', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 10 },
                {
                    $lookup: {
                        from: 'users',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                { $unwind: '$user' },
                {
                    $project: {
                        _id: 1,
                        count: 1,
                        first_name: '$user.first_name',
                        last_name: '$user.last_name',
                        email: '$user.email'
                    }
                }
            ]);
            return ApiResponse.success(res, {
                total_referrals: totalReferrals,
                top_referrers: topReferrers
            }, 'Global referral stats retrieved successfully');
        }
        catch (error) {
            return ApiResponse.error(res, error.message, 500);
        }
    }
}
