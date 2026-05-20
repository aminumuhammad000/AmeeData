import mongoose, { Schema } from 'mongoose';
const FundingAccountSchema = new Schema({
    bankName: { type: String, required: true },
    accountName: { type: String, required: true },
    accountNumber: { type: String, required: true },
    instructions: { type: String },
    active: { type: Boolean, default: true },
}, { timestamps: true });
export const FundingAccount = mongoose.model('FundingAccount', FundingAccountSchema);
export default FundingAccount;
