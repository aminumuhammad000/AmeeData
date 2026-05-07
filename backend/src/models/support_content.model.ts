import mongoose, { Document, Schema } from 'mongoose';

export interface ISupportContent extends Document {
    email: string;
    phoneNumber: string;
    whatsappNumber: string;
    facebookUrl?: string;
    twitterUrl?: string;
    instagramUrl?: string;
    websiteUrl?: string;
    updated_at: Date;
}

const supportContentSchema = new Schema<ISupportContent>({
    email: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    whatsappNumber: { type: String, required: true },
    facebookUrl: { type: String },
    twitterUrl: { type: String },
    instagramUrl: { type: String },
    websiteUrl: { type: String },
    updated_at: { type: Date, default: Date.now }
});

export const SupportContent = mongoose.model<ISupportContent>('SupportContent', supportContentSchema);
