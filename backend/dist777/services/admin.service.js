// services/admin.service.ts
import { AuditLog } from '../models/index.js';
export class AdminService {
    static async logAction(data) {
        return await AuditLog.create({
            ...data,
            timestamp: new Date()
        });
    }
}
