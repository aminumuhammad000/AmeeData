// models/wallet.model.ts
import mongoose, { Schema } from 'mongoose';
const walletSchema = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    balance: { type: Number, default: 0 },
    currency: { type: String, default: 'NGN' },
    last_transaction_at: { type: Date },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});
export const Wallet = mongoose.model('Wallet', walletSchema);
