// models/transaction.model.ts
import mongoose, { Schema } from 'mongoose';
import { ITransaction } from '../types.js';

const transactionSchema = new Schema<ITransaction>({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  wallet_id: { type: Schema.Types.ObjectId, ref: 'Wallet', required: true },
  type: { 
    type: String, 
    enum: ['airtime_topup', 'data_purchase', 'bill_payment', 'wallet_topup', 'e-pin_purchase'],
    required: true 
  },
  amount: { type: Number, required: true },
  fee: { type: Number, default: 0 },
  total_charged: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'successful', 'failed', 'refunded'],
    default: 'pending' 
  },
  reference_number: { type: String, unique: true, required: true },
  description: { type: String },
  payment_method: { type: String, required: true },
  destination_account: { type: String },
  operator_id: { type: Schema.Types.ObjectId, ref: 'Operator' },
  plan_id: { type: Schema.Types.ObjectId, ref: 'Plan' },
  receipt_url: { type: String },
  error_message: { type: String },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

export const Transaction = mongoose.model<ITransaction>('Transaction', transactionSchema);