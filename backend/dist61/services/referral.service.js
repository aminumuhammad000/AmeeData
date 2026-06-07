import { ReferralSetting, Transaction, User, Wallet } from '../models/index.js';
import { WalletService } from './wallet.service.js';
export class ReferralService {
    /**
     * Process referral rewards for a user after a successful transaction
     */
    static async processReferralReward(userId, amount) {
        try {
            const settings = await ReferralSetting.findOne({ is_active: true });
            if (!settings || !settings.auto_credit_enabled) {
                return;
            }
            const user = await User.findById(userId);
            if (!user || !user.referred_by) {
                return;
            }
            // Check if referrer has already been rewarded for this user
            const alreadyRewarded = await Transaction.findOne({
                user_id: user.referred_by,
                type: 'referral_bonus',
                related_user_id: user._id,
                status: 'successful'
            });
            if (alreadyRewarded) {
                return;
            }
            // Check if user meets minimum transaction requirement
            // Option A: This transaction meets the requirement
            // Option B: Total successful transactions meet the requirement
            // We'll go with Option B for better fairness
            const totalSuccessfulTransactions = await Transaction.aggregate([
                {
                    $match: {
                        user_id: user._id,
                        status: 'successful',
                        type: { $ne: 'referral_bonus' } // Don't count bones themselves if any
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: '$amount' }
                    }
                }
            ]);
            const currentTotal = (totalSuccessfulTransactions[0]?.total || 0);
            if (currentTotal < settings.min_transaction_for_bonus) {
                return;
            }
            // Process rewards
            const referrerId = user.referred_by;
            // 1. Credit Referrer
            if (settings.referrer_bonus_amount > 0) {
                await this.applyBonus(referrerId, settings.referrer_bonus_amount, `Referral bonus for inviting ${user.first_name} ${user.last_name}`, user._id);
            }
            // 2. Credit Referee
            if (settings.referee_bonus_amount > 0) {
                await this.applyBonus(user._id, settings.referee_bonus_amount, `Welcome bonus for being referred`, referrerId);
            }
        }
        catch (error) {
            console.error('Error processing referral reward:', error);
        }
    }
    static async applyBonus(userId, amount, description, relatedUserId) {
        const wallet = await Wallet.findOne({ user_id: userId });
        if (!wallet)
            return;
        const reference = `REF_BONUS_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        await Transaction.create({
            user_id: userId,
            wallet_id: wallet._id,
            amount: amount,
            type: 'referral_bonus',
            status: 'successful',
            reference_number: reference,
            description: description,
            related_user_id: relatedUserId,
            payment_method: 'referral_system',
            fee: 0,
            total_charged: 0
        });
        await WalletService.creditWallet(userId, amount);
    }
}
