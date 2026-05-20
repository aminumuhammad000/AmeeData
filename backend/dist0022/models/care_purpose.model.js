import mongoose from 'mongoose';
const carePurposeSchema = new mongoose.Schema({
    label: { type: String, required: true, unique: true },
    is_active: { type: Boolean, default: true },
    icon: { type: String, default: 'heart' },
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});
export const CarePurpose = mongoose.model('CarePurpose', carePurposeSchema);
