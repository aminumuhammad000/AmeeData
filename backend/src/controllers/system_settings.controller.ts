// controllers/system_settings.controller.ts
import { Response } from 'express';
import { SystemSetting } from '../models/index.js';
import { AuthRequest } from '../types/index.js';
import { ApiResponse } from '../utils/response.js';

export class SystemSettingsController {

    static async getSettings(req: AuthRequest, res: Response) {
        try {
            // Fetch settings. If not exists, return defaults.
            let settings = await SystemSetting.findOne({ type: 'global_config' });

            if (!settings) {
                // Default settings
                return ApiResponse.success(res, {
                    payment_gateway: 'vtpay', // Default as requested
                    notification_email: 'noreply@example.com',
                }, 'Settings retrieved (defaults)');
            }

            return ApiResponse.success(res, settings.config, 'Settings retrieved successfully');
        } catch (error: any) {
            return ApiResponse.error(res, error.message, 500);
        }
    }

    static async updateSettings(req: AuthRequest, res: Response) {
        try {
            // Check for super admin?
            const { payment_gateway, notification_email, email_config } = req.body;

            // Update or Create
            const settings = await SystemSetting.findOneAndUpdate(
                { type: 'global_config' },
                {
                    $set: {
                        'config.payment_gateway': payment_gateway,
                        'config.notification_email': notification_email,
                        'config.email_config': email_config
                    }
                },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );

            return ApiResponse.success(res, settings.config, 'Settings updated successfully');
        } catch (error: any) {
            return ApiResponse.error(res, error.message, 500);
        }
    }
}
