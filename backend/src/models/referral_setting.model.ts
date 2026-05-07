// models/referral_setting.model.ts
import mongoose, { Schema } from 'mongoose';
import { IReferralSetting } from '../types.js';

const referralSettingSchema = new Schema<IReferralSetting>({
  referrer_bonus_amount: { type: Number, required: true },
  referee_bonus_amount: { type: Number, required: true },
  min_transaction_for_bonus: { type: Number, required: true },
  terms_and_conditions_url: { type: String },
  is_active: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

export const ReferralSetting = mongoose.model<IReferralSetting>('ReferralSetting', referralSettingSchema);
