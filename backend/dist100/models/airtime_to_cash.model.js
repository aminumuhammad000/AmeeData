import mongoose, { Schema } from 'mongoose';
const airtimeToCashRequestSchema = new Schema({
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
export const AirtimeToCashRequest = mongoose.model('AirtimeToCashRequest', airtimeToCashRequestSchema);
