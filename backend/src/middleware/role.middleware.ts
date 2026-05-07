// middleware/role.middleware.ts
import { Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/response.js';
import { AuthRequest } from '../types/index.js';
import { AdminUser, RolePermission } from '../models/index.js';

export const checkPermission = (permission: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const adminId = req.user?.id;
      
      if (!adminId) {
        return ApiResponse.error(res, 'Unauthorized', 401);
      }

      const admin = await AdminUser.findById(adminId).populate('role_id');
      if (!admin) {
        return ApiResponse.error(res, 'Admin not found', 404);
      }

      const hasPermission = await RolePermission.findOne({
        role_id: admin.role_id,
        permission_id: { $in: await getPermissionId(permission) }
      });

      if (!hasPermission) {
        return ApiResponse.error(res, 'Insufficient permissions', 403);
      }

      next();
    } catch (error) {
      return ApiResponse.error(res, 'Permission check failed', 500);
    }
  };
};

const getPermissionId = async (permissionName: string) => {
  const { AdminPermission } = await import('../models/index.js');
  const permission = await AdminPermission.findOne({ name: permissionName });
  return permission?._id;
};