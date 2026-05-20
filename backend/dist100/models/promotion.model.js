// models/promotion.model.ts
import mongoose, { Schema } from 'mongoose';
const promotionSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String },
    type: { type: String, enum: ['discount', 'cashback', 'referral_bonus'], required: true },
    start_date: { type: Date, required: true },
    end_date: { type: Date, required: true },
    code: { type: String },
    status: { type: String, enum: ['active', 'inactive', 'ended'], default: 'active' },
    target_users: { type: String, required: true },
    banner_image_url: { type: String },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});
export const Promotion = mongoose.model('Promotion', promotionSchema);
