import { AirtimeToCashRequest } from '../models/airtime_to_cash.model.js';
import { AirtimeToCashSetting } from '../models/airtime_to_cash_setting.model.js';
import { ApiResponse } from '../utils/response.js';
export const AirtimeToCashController = {
    submitRequest: async (req, res) => {
        try {
            const { network, phone_number, amount } = req.body;
            const userId = req.user?.id;
            if (!userId) {
                return ApiResponse.error(res, 'Unauthorized', 401);
            }
            // Basic validation
            if (!network || !phone_number || !amount) {
                return ApiResponse.error(res, 'All fields are required', 400);
            }
            // Fetch settings for this network
            const setting = await AirtimeToCashSetting.findOne({ network, is_active: true });
            if (!setting) {
                return ApiResponse.error(res, 'This network is currently not supported for Airtime to Cash', 400);
            }
            if (amount < setting.min_amount || amount > setting.max_amount) {
                return ApiResponse.error(res, `Amount must be between ₦${setting.min_amount} and ₦${setting.max_amount}`, 400);
            }
            const amount_to_receive = (amount * setting.conversion_rate) / 100;
            const newRequest = new AirtimeToCashRequest({
                user_id: userId,
                network,
                phone_number,
                amount,
                amount_to_receive
            });
            await newRequest.save();
            return ApiResponse.success(res, newRequest, 'Airtime to Cash request submitted successfully', 201);
        }
        catch (error) {
            console.error('Submit Airtime to Cash Error:', error);
            return ApiResponse.error(res, 'Server error. Please try again later.', 500);
        }
    },
    getMyRequests: async (req, res) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return ApiResponse.error(res, 'Unauthorized', 401);
            }
            const requests = await AirtimeToCashRequest.find({ user_id: userId }).sort({ created_at: -1 });
            return ApiResponse.success(res, requests, 'Requests retrieved successfully');
        }
        catch (error) {
            console.error('Get My Requests Error:', error);
            return ApiResponse.error(res, 'Server error. Please try again later.', 500);
        }
    },
    getSettings: async (req, res) => {
        try {
            const settings = await AirtimeToCashSetting.find({ is_active: true });
            return ApiResponse.success(res, settings, 'Settings retrieved successfully');
        }
        catch (error) {
            console.error('Get Settings Error:', error);
            return ApiResponse.error(res, 'Server error. Please try again later.', 500);
        }
    }
};
