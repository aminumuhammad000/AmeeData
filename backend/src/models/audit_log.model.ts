// models audit_log.model.ts
import mongoose, { Schema } from 'mongoose';
import { IAuditLog } from '../types.js';

const auditLogSchema = new Schema<IAuditLog>({
  admin_id: { type: Schema.Types.ObjectId, ref: 'AdminUser' },
  user_id: { type: Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true },
  entity_type: { type: String, required: true },
  entity_id: { type: Schema.Types.ObjectId },
  old_value: { type: Schema.Types.Mixed },
  new_value: { type: Schema.Types.Mixed },
  ip_address: { type: String },
  timestamp: { type: Date, default: Date.now }
});

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
