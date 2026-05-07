import { User } from '../models/user.model.js';
export const apiKeyMiddleware = async (req, res, next) => {
    // Check for API key in headers (case-insensitive)
    const apiKey = (req.headers['x-api-key'] || req.headers['X-API-Key']);
    if (!apiKey) {
        // Log for debugging on VPS
        console.log('🔑 No API key provided, continuing to JWT check');
        return next(); // Continue to check for JWT if no API key is provided
    }
    try {
        console.log('🔐 API Key authentication attempt');
        console.log('   Key prefix:', apiKey.substring(0, 10) + '...');
        const user = await User.findOne({ api_key: apiKey, api_key_enabled: true });
        if (!user) {
            console.error('❌ Invalid or disabled API key');
            return res.status(401).json({
                success: false,
                message: 'Invalid or disabled API key',
            });
        }
        console.log('✅ API Key validated for user:', user.email);
        // Attach user info to request object
        req.user = {
            id: user._id.toString(),
            email: user.email,
        };
        next();
    }
    catch (error) {
        console.error('❌ API Key validation error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during API key validation',
        });
    }
};
