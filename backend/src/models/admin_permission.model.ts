// models/admin_permission.model.ts
import mongoose, { Schema } from 'mongoose';
import { IAdminPermission } from '../types.js';

const adminPermissionSchema = new Schema<IAdminPermission>({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

export const AdminPermission = mongoose.model<IAdminPermission>('AdminPermission', adminPermissionSchema);
