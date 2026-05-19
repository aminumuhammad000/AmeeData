import { Response } from 'express';
import { CareCircleMember, CareRequest, User, Wallet, Transaction } from '../models/index.js';
import { ApiResponse } from '../utils/response.js';
import { AuthRequest } from '../types/index.js';

export class AdminCareController {
  /**
   * Get overall stats for I Care ecosystem
   */
  static async getStats(req: AuthRequest, res: Response) {
    try {
      const [
        totalRequests,
        pendingRequests,
        acceptedRequests,
        totalCircleMembers,
        totalCareVolumeResult,
        totalCareBalanceResult
      ] = await Promise.all([
        CareRequest.countDocuments(),
        CareRequest.countDocuments({ status: 'pending' }),
        CareRequest.countDocuments({ status: 'accepted' }),
        CareCircleMember.countDocuments(),
        Transaction.aggregate([
          { $match: { reference_number: { $regex: /^CARE-/, $options: 'i' }, status: 'successful' } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]),
        Wallet.aggregate([
          { $group: { _id: null, total: { $sum: '$care_balance' } } }
        ])
      ]);

      return ApiResponse.success(res, {
        total_requests: totalRequests,
        pending_requests: pendingRequests,
        accepted_requests: acceptedRequests,
        total_circle_members: totalCircleMembers,
        total_care_volume: totalCareVolumeResult.length > 0 ? totalCareVolumeResult[0].total : 0,
        total_locked_care_balance: totalCareBalanceResult.length > 0 ? totalCareBalanceResult[0].total : 0
      }, 'Care stats retrieved successfully');
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 500);
    }
  }

  /**
   * Get all care requests
   */
  static async getRequests(req: AuthRequest, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;
      const status = req.query.status as string;

      const query: any = {};
      if (status) query.status = status;

      const requests = await CareRequest.find(query)
        .populate('requester_id', 'first_name last_name email phone_number')
        .populate('provider_id', 'first_name last_name email phone_number')
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit);

      const total = await CareRequest.countDocuments(query);

      return ApiResponse.paginated(res, requests, {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }, 'Care requests retrieved successfully');
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 500);
    }
  }

  /**
   * Get all care circle memberships
   */
  static async getCircleMemberships(req: AuthRequest, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;

      const memberships = await CareCircleMember.find()
        .populate('user_id', 'first_name last_name email phone_number')
        .populate('member_id', 'first_name last_name email phone_number')
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit);

      const total = await CareCircleMember.countDocuments();

      return ApiResponse.paginated(res, memberships, {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }, 'Care circle memberships retrieved successfully');
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 500);
    }
  }
}
