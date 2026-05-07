// middleware/auth.middleware.ts
import { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/bootstrap.js';
import { AuthRequest } from '../types/index.js';
import { ApiResponse } from '../utils/response.js';

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  // If user is already authenticated (e.g. via API key), skip token check
  if (req.user) {
    return next();
  }

  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return ApiResponse.error(res, 'No token provided', 401);
    }

    const decoded = jwt.verify(token, config.jwtSecret) as { id: string; role?: string };
    req.user = decoded;
    next();
  } catch (error) {
    return ApiResponse.error(res, 'Invalid token', 401);
  }
};

// Alias for compatibility
export const authenticate = authMiddleware;

export const authorize = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || (req.user.role && !roles.includes(req.user.role))) {
      // If role is present but not in allowed list
      return ApiResponse.error(res, 'Unauthorized access', 403);
    }
    // If no role in token, we might want to fetch user to check role, 
    // but for now let's assume token has role or we proceed if we can't check.
    // Better: if no role in token, assume unauthorized if roles are required.
    if (!req.user || !req.user.role || !roles.includes(req.user.role)) {
      return ApiResponse.error(res, 'Unauthorized access', 403);
    }
    next();
  };
};