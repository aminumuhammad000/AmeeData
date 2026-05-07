// models/role_permission.model.ts
import mongoose, { Schema } from 'mongoose';
import { IRolePermission } from '../types.js';

const rolePermissionSchema = new Schema<IRolePermission>({
  role_id: { type: Schema.Types.ObjectId, ref: 'AdminRole', required: true },
  permission_id: { type: Schema.Types.ObjectId, ref: 'AdminPermission', required: true }
});

export const RolePermission = mongoose.model<IRolePermission>('RolePermission', rolePermissionSchema);
