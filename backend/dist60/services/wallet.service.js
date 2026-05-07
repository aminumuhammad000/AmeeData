// services wallet.service.ts
import { Wallet } from '../models/index.js';
export class WalletService {
    static async createWallet(user_id) {
        return await Wallet.create({
            user_id,
            balance: 0,
            currency: 'NGN'
        });
    }
    static async getBalance(user_id) {
        const wallet = await Wallet.findOne({ user_id });
        return wallet?.balance || 0;
    }
    static async creditWallet(user_id, amount) {
        const result = await Wallet.findOneAndUpdate({ user_id }, {
            $inc: { balance: amount },
            $set: { last_transaction_at: new Date(), updated_at: new Date() }
        }, { new: true, upsert: false });
        if (!result)
            throw new Error('Wallet not found');
        return true;
    }
    static async debitWallet(user_id, amount) {
        // We use a filter on balance to ensure we don't go below 0 (atomic check)
        const result = await Wallet.findOneAndUpdate({
            user_id,
            balance: { $gte: amount }
        }, {
            $inc: { balance: -amount },
            $set: { last_transaction_at: new Date(), updated_at: new Date() }
        }, { new: true });
        if (!result) {
            const wallet = await Wallet.findOne({ user_id });
            if (!wallet)
                throw new Error('Wallet not found');
            throw new Error('Insufficient balance');
        }
        return true;
    }
    // Alias methods for compatibility
    static async getWalletByUserId(user_id) {
        return await Wallet.findOne({ user_id });
    }
    static async debit(user_id, amount, description) {
        return await this.debitWallet(user_id, amount);
    }
    static async credit(user_id, amount, description) {
        return await this.creditWallet(user_id, amount);
    }
}
