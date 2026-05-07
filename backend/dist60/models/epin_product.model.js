// models epin_product.model.ts
import mongoose, { Schema } from 'mongoose';
const epinProductSchema = new Schema({
    name: { type: String, required: true },
    value: { type: Number, required: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});
export const EPinProduct = mongoose.model('EPinProduct', epinProductSchema);
