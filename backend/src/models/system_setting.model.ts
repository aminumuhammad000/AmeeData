import mongoose, { Document, Schema } from 'mongoose';

export interface ISystemSetting extends Document {
    type: string;
    config: {
        payment_gateway: string;
        notification_email: string;
        email_config?: {
            smtp_host: string;
            smtp_port: number;
            smtp_user: string;
            smtp_pass: string;
            smtp_secure: boolean;
            sender_name: string;
        };
        [key: string]: any;
    };
    updated_at: Date;
}

const SystemSettingSchema: Schema = new Schema({
    type: { type: String, required: true, unique: true, default: 'global_config' },
    config: {
        payment_gateway: { type: String, default: 'vtstack', enum: ['vtpay', 'payrant', 'vtstack'] },
        notification_email: { type: String, default: 'noreply@example.com' },
        email_config: {
            smtp_host: { type: String, default: '' },
            smtp_port: { type: Number, default: 587 },
            smtp_user: { type: String, default: '' },
            smtp_pass: { type: String, default: '' },
            smtp_secure: { type: Boolean, default: false },
            sender_name: { type: String, default: 'VTU App' },
        },
        preferred_data_provider: { type: String, default: null },
        preferred_airtime_provider: { type: String, default: null },
        preferred_both_provider: { type: String, default: null },
        preferred_cable_provider: { type: String, default: null },
        preferred_electricity_provider: { type: String, default: null },
        preferred_exampin_provider: { type: String, default: null },
    },
    updated_at: { type: Date, default: Date.now },
});

export const SystemSetting = mongoose.model<ISystemSetting>('SystemSetting', SystemSettingSchema);
