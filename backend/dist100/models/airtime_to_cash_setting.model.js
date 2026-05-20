import mongoose, { Schema } from 'mongoose';
const airtimeToCashSettingSchema = new Schema({
    network: { type: String, required: true, unique: true },
    conversion_rate: { type: Number, required: true, default: 80 },
    min_amount: { type: Number, default: 500 },
    max_amount: { type: Number, default: 10000 },
    phone_number: { type: String, required: true },
    is_active: { type: Boolean, default: true },
    updated_at: { type: Date, default: Date.now }
});
export const AirtimeToCashSetting = mongoose.model('AirtimeToCashSetting', airtimeToCashSettingSchema);
