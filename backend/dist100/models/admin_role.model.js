// models/admin_role.model.ts
import mongoose, { Schema } from 'mongoose';
const adminRoleSchema = new Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String },
    permissions: [{ type: String }],
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});
export const AdminRole = mongoose.model('AdminRole', adminRoleSchema);
