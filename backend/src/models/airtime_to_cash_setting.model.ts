import mongoose, { Document, Schema } from 'mongoose';

export interface IAirtimeToCashSetting extends Document {
    network: string; // e.g., 'MTN', 'Airtel'
    conversion_rate: number; // e.g., 80 for 80% (user gets ₦80 for ₦100 airtime)
    min_amount: number;
    max_amount: number;
    phone_number: string; // The phone number the user should send airtime to
    is_active: boolean;
    updated_at: Date;
}

const airtimeToCashSettingSchema = new Schema<IAirtimeToCashSetting>({
    network: { type: String, required: true, unique: true },
    conversion_rate: { type: Number, required: true, default: 80 },
    min_amount: { type: Number, default: 500 },
    max_amount: { type: Number, default: 10000 },
    phone_number: { type: String, required: true },
    is_active: { type: Boolean, default: true },
    updated_at: { type: Date, default: Date.now }
});

export const AirtimeToCashSetting = mongoose.model<IAirtimeToCashSetting>('AirtimeToCashSetting', airtimeToCashSettingSchema);
