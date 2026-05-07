// modelsadmin_user.model.ts
import mongoose, { Schema } from 'mongoose';
import { IAdminUser } from '../types.js';

const adminUserSchema = new Schema<IAdminUser>({
  email: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  role_id: { type: Schema.Types.ObjectId, ref: 'AdminRole', required: true },
  last_login_at: { type: Date },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

export const AdminUser = mongoose.model<IAdminUser>('AdminUser', adminUserSchema);
