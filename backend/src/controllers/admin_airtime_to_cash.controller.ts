import { Request, Response } from 'express';
import { AirtimeToCashRequest, AirtimeToCashSetting, Transaction, Wallet } from '../models/index.js';
import { ApiResponse } from '../utils/response.js';

export class AdminAirtimeToCashController {
    // Get all requests
    static async getRequests(req: Request, res: Response) {
        try {
            const requests = await AirtimeToCashRequest.find()
                .populate('user_id', 'first_name last_name email phone_number')
                .sort({ created_at: -1 });
            return ApiResponse.success(res, requests);
        } catch (error: any) {
            return ApiResponse.error(res, error.message);
        }
    }

    // Update request status (approve/reject)
    static async updateRequestStatus(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { status, admin_note } = req.body;

            const request = await AirtimeToCashRequest.findById(id);
            if (!request) return ApiResponse.error(res, 'Request not found', 404);

            if (request.status !== 'pending') {
                return ApiResponse.error(res, 'Request has already been processed');
            }

            request.status = status;
            request.admin_note = admin_note;
            request.updated_at = new Date();
            await request.save();

            // If approved, credit user's wallet
            if (status === 'approved') {
                const wallet = await Wallet.findOne({ user_id: request.user_id });
                if (wallet) {
                    wallet.balance += request.amount_to_receive;
                    await wallet.save();

                    // Create transaction record
                    await Transaction.create({
                        user_id: request.user_id,
                        amount: request.amount_to_receive,
                        type: 'funding',
                        status: 'success',
                        description: `Airtime to Cash (${request.network}) approved`,
                        reference: `A2C-${Date.now()}`
                    });
                }
            }

            return ApiResponse.success(res, request, 'Request updated successfully');
        } catch (error: any) {
            return ApiResponse.error(res, error.message);
        }
    }

    // Get settings
    static async getSettings(req: Request, res: Response) {
        try {
            const settings = await AirtimeToCashSetting.find();
            return ApiResponse.success(res, settings);
        } catch (error: any) {
            return ApiResponse.error(res, error.message);
        }
    }

    // Update settings
    static async updateSetting(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            updateData.updated_at = new Date();

            const setting = await AirtimeToCashSetting.findByIdAndUpdate(id, updateData, { new: true });
            return ApiResponse.success(res, setting, 'Setting updated successfully');
        } catch (error: any) {
            return ApiResponse.error(res, error.message);
        }
    }

    // Create new network setting
    static async createSetting(req: Request, res: Response) {
        try {
            const setting = await AirtimeToCashSetting.create(req.body);
            return ApiResponse.success(res, setting, 'New network setting added');
        } catch (error: any) {
            return ApiResponse.error(res, error.message);
        }
    }
}
