import { AirtimeToCashRequest, AirtimeToCashSetting, Transaction, Wallet } from '../models/index.js';
import { ApiResponse } from '../utils/response.js';
export class AdminAirtimeToCashController {
    // Get all requests
    static async getRequests(req, res) {
        try {
            const requests = await AirtimeToCashRequest.find()
                .populate('user_id', 'first_name last_name email phone_number')
                .sort({ created_at: -1 });
            return ApiResponse.success(res, requests);
        }
        catch (error) {
            return ApiResponse.error(res, error.message);
        }
    }
    // Update request status (approve/reject)
    static async updateRequestStatus(req, res) {
        try {
            const { id } = req.params;
            const { status, admin_note } = req.body;
            const request = await AirtimeToCashRequest.findById(id);
            if (!request)
                return ApiResponse.error(res, 'Request not found', 404);
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
        }
        catch (error) {
            return ApiResponse.error(res, error.message);
        }
    }
    // Get settings
    static async getSettings(req, res) {
        try {
            const settings = await AirtimeToCashSetting.find();
            return ApiResponse.success(res, settings);
        }
        catch (error) {
            return ApiResponse.error(res, error.message);
        }
    }
    // Update settings
    static async updateSetting(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            updateData.updated_at = new Date();
            const setting = await AirtimeToCashSetting.findByIdAndUpdate(id, updateData, { new: true });
            return ApiResponse.success(res, setting, 'Setting updated successfully');
        }
        catch (error) {
            return ApiResponse.error(res, error.message);
        }
    }
    // Create new network setting
    static async createSetting(req, res) {
        try {
            const setting = await AirtimeToCashSetting.create(req.body);
            return ApiResponse.success(res, setting, 'New network setting added');
        }
        catch (error) {
            return ApiResponse.error(res, error.message);
        }
    }
}
