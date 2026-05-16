// models/biller.model.ts
import mongoose, { Schema } from 'mongoose';
const billerSchema = new Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    logo_url: { type: String },
    api_endpoint: { type: String },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});
export const Biller = mongoose.model('Biller', billerSchema);
