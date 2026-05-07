import mongoose, { Document, Schema } from 'mongoose';

export interface IAirtimeToCashRequest extends Document {
    user_id: mongoose.Types.ObjectId;
    network: string;
    phone_number: string;
    amount: number;
    amount_to_receive: number;
    status: 'pending' | 'approved' | 'rejected';
    admin_note?: string;
    created_at: Date;
    updated_at: Date;
}

const airtimeToCashRequestSchema = new Schema<IAirtimeToCashRequest>({
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    network: { type: String, required: true },
    phone_number: { type: String, required: true },
    amount: { type: Number, required: true },
    amount_to_receive: { type: Number, required: true },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    admin_note: { type: String },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

export const AirtimeToCashRequest = mongoose.model<IAirtimeToCashRequest>('AirtimeToCashRequest', airtimeToCashRequestSchema);
