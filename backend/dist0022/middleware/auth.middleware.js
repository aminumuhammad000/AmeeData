import jwt from 'jsonwebtoken';
import { config } from '../config/bootstrap.js';
import { ApiResponse } from '../utils/response.js';
export const authMiddleware = (req, res, next) => {
    // If user is already authenticated (e.g. via API key), skip token check
    if (req.user) {
        return next();
    }
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return ApiResponse.error(res, 'No token provided', 401);
        }
        const decoded = jwt.verify(token, config.jwtSecret);
        req.user = decoded;
        next();
    }
    catch (error) {
        return ApiResponse.error(res, 'Invalid token', 401);
    }
};
// Alias for compatibility
export const authenticate = authMiddleware;
export const authorize = (roles) => {
    return (req, res, next) => {
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
