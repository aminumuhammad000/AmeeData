// services wallet.service.ts
import { Wallet, Transaction } from '../models/index.js';
import { Types } from 'mongoose';

export class WalletService {
  static async createWallet(user_id: Types.ObjectId) {
    return await Wallet.create({
      user_id,
      balance: 0,
      currency: 'NGN'
    });
  }

  static async getBalance(user_id: Types.ObjectId): Promise<number> {
    const wallet = await Wallet.findOne({ user_id });
    return wallet?.balance || 0;
  }

  static async creditWallet(user_id: Types.ObjectId | string, amount: number): Promise<boolean> {
    const result = await Wallet.findOneAndUpdate(
      { user_id },
      { 
        $inc: { balance: amount },
        $set: { last_transaction_at: new Date(), updated_at: new Date() }
      },
      { new: true, upsert: false }
    );
    
    if (!result) throw new Error('Wallet not found');
    return true;
  }

  static async debitWallet(user_id: Types.ObjectId | string, amount: number): Promise<boolean> {
    // We use a filter on balance to ensure we don't go below 0 (atomic check)
    const result = await Wallet.findOneAndUpdate(
      { 
        user_id,
        balance: { $gte: amount }
      },
      { 
        $inc: { balance: -amount },
        $set: { last_transaction_at: new Date(), updated_at: new Date() }
      },
      { new: true }
    );

    if (!result) {
      const wallet = await Wallet.findOne({ user_id });
      if (!wallet) throw new Error('Wallet not found');
      throw new Error('Insufficient balance');
    }
    return true;
  }

  // Alias methods for compatibility
  static async getWalletByUserId(user_id: Types.ObjectId | string) {
    return await Wallet.findOne({ user_id });
  }

  static async debit(user_id: Types.ObjectId | string, amount: number, description?: string) {
    return await this.debitWallet(user_id, amount);
  }

  static async credit(user_id: Types.ObjectId | string, amount: number, description?: string) {
    return await this.creditWallet(user_id, amount);
  }
}