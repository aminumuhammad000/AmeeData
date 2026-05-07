// services/admin.service.ts
import { AuditLog } from '../models/index.js';
import { Types } from 'mongoose';

export class AdminService {
  static async logAction(data: {
    admin_id?: Types.ObjectId;
    user_id?: Types.ObjectId;
    action: string;
    entity_type: string;
    entity_id?: Types.ObjectId;
    old_value?: any;
    new_value?: any;
    ip_address?: string;
  }) {
    return await AuditLog.create({
      ...data,
      timestamp: new Date()
    });
  }
}