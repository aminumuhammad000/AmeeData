import { Response } from 'express';
import { SupportContent } from '../models/support_content.model.js';
import { AuthRequest } from '../types/index.js';
import { ApiResponse } from '../utils/response.js';

export class SupportContentController {
    static async getContent(req: AuthRequest, res: Response) {
        try {
            let content = await SupportContent.findOne();

            if (!content) {
                // Create default content if none exists
                content = await SupportContent.create({
                    email: 'support@example.com',
                    phoneNumber: '+2340000000000',
                    whatsappNumber: '+2340000000000'
                });
            }

            return ApiResponse.success(res, content, 'Support content retrieved successfully');
        } catch (error: any) {
            return ApiResponse.error(res, error.message, 500);
        }
    }

    static async updateContent(req: AuthRequest, res: Response) {
        try {
            const {
                email,
                phoneNumber,
                whatsappNumber,
                facebookUrl,
                twitterUrl,
                instagramUrl,
                websiteUrl
            } = req.body;

            let content = await SupportContent.findOne();

            if (content) {
                content.email = email || content.email;
                content.phoneNumber = phoneNumber || content.phoneNumber;
                content.whatsappNumber = whatsappNumber || content.whatsappNumber;
                content.facebookUrl = facebookUrl;
                content.twitterUrl = twitterUrl;
                content.instagramUrl = instagramUrl;
                content.websiteUrl = websiteUrl;
                content.updated_at = new Date();
                await content.save();
            } else {
                content = await SupportContent.create({
                    email,
                    phoneNumber,
                    whatsappNumber,
                    facebookUrl,
                    twitterUrl,
                    instagramUrl,
                    websiteUrl
                });
            }

            return ApiResponse.success(res, content, 'Support content updated successfully');
        } catch (error: any) {
            return ApiResponse.error(res, error.message, 500);
        }
    }
}
