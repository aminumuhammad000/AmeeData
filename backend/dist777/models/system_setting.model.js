import mongoose, { Schema } from 'mongoose';
const SystemSettingSchema = new Schema({
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
    },
    updated_at: { type: Date, default: Date.now },
});
export const SystemSetting = mongoose.model('SystemSetting', SystemSettingSchema);
