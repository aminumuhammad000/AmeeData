import mongoose, { Schema } from 'mongoose';
const supportContentSchema = new Schema({
    email: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    whatsappNumber: { type: String, required: true },
    facebookUrl: { type: String },
    twitterUrl: { type: String },
    instagramUrl: { type: String },
    websiteUrl: { type: String },
    updated_at: { type: Date, default: Date.now }
});
export const SupportContent = mongoose.model('SupportContent', supportContentSchema);
