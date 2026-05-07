// models/otp.model.ts
import mongoose, { Schema } from 'mongoose';
const otpSchema = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'User' },
    phone_number: { type: String, required: true },
    email: { type: String },
    otp_code: { type: String, required: true },
    expires_at: { type: Date, required: true },
    is_used: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now }
});
export const OTP = mongoose.model('OTP', otpSchema);
