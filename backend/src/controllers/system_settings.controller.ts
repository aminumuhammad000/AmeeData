// controllers/system_settings.controller.ts
import { Response } from 'express';
import { SystemSetting } from '../models/index.js';
import { AuthRequest } from '../types/index.js';
import { ApiResponse } from '../utils/response.js';

export class SystemSettingsController {

    static async getSettings(req: AuthRequest, res: Response) {
        try {
            let settings = await SystemSetting.findOne({ type: 'global_config' });

            if (!settings) {
                return ApiResponse.success(res, {
                    payment_gateway: 'vtpay',
                    notification_email: 'noreply@example.com',
                    preferred_data_provider: null,
                    preferred_airtime_provider: null,
                    preferred_both_provider: null,
                }, 'Settings retrieved (defaults)');
            }

            return ApiResponse.success(res, settings.config, 'Settings retrieved successfully');
        } catch (error: any) {
            return ApiResponse.error(res, error.message, 500);
        }
    }

    static async updateSettings(req: AuthRequest, res: Response) {
        try {
            const {
                payment_gateway,
                notification_email,
                email_config,
                preferred_data_provider,
                preferred_airtime_provider,
                preferred_both_provider,
                preferred_cable_provider,
                preferred_electricity_provider,
                preferred_exampin_provider,
            } = req.body;

            const $setFields: Record<string, any> = {};
            if (payment_gateway !== undefined) $setFields['config.payment_gateway'] = payment_gateway;
            if (notification_email !== undefined) $setFields['config.notification_email'] = notification_email;
            if (email_config !== undefined) $setFields['config.email_config'] = email_config;
            if (preferred_data_provider !== undefined) $setFields['config.preferred_data_provider'] = preferred_data_provider || null;
            if (preferred_airtime_provider !== undefined) $setFields['config.preferred_airtime_provider'] = preferred_airtime_provider || null;
            if (preferred_both_provider !== undefined) $setFields['config.preferred_both_provider'] = preferred_both_provider || null;
            if (preferred_cable_provider !== undefined) $setFields['config.preferred_cable_provider'] = preferred_cable_provider || null;
            if (preferred_electricity_provider !== undefined) $setFields['config.preferred_electricity_provider'] = preferred_electricity_provider || null;
            if (preferred_exampin_provider !== undefined) $setFields['config.preferred_exampin_provider'] = preferred_exampin_provider || null;

            const settings = await SystemSetting.findOneAndUpdate(
                { type: 'global_config' },
                { $set: $setFields },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );

            return ApiResponse.success(res, settings.config, 'Settings updated successfully');
        } catch (error: any) {
            return ApiResponse.error(res, error.message, 500);
        }
    }
}
