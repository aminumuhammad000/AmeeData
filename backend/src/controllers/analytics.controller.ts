// controllers/analytics.controller.ts
import { Request, Response } from 'express';
import { Transaction } from '../models/index.js';
import { ApiResponse } from '../utils/response.js';

export class AnalyticsController {
  /**
   * Get transaction leaderboard
   * @route GET /api/admin/analytics/leaderboard
   */
  static async getLeaderboard(req: Request, res: Response) {
    try {
      const period = (req.query.period as string) || 'monthly';
      const now = new Date();
      let startDate = new Date();

      switch (period) {
        case 'daily':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'weekly':
          // Set to 7 days ago
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'monthly':
          // Set to 30 days ago
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'all-time':
          startDate = new Date(0);
          break;
        default:
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // Default to monthly
      }

      const leaderboard = await Transaction.aggregate([
        {
          $match: {
            status: 'successful',
            created_at: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: '$user_id',
            totalSpent: { $sum: '$amount' },
            transactionCount: { $sum: 1 }
          }
        },
        { $sort: { totalSpent: -1 } },
        { $limit: 20 }, // Get top 20
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: '$user' },
        {
          $project: {
            _id: 1,
            totalSpent: 1,
            transactionCount: 1,
            'user.first_name': 1,
            'user.last_name': 1,
            'user.email': 1,
            'user.phone_number': 1
          }
        }
      ]);

      return ApiResponse.success(res, leaderboard, `Leaderboard (${period}) retrieved successfully`);
    } catch (error: any) {
      console.error('Leaderboard Error:', error);
      return ApiResponse.error(res, error.message, 500);
    }
  }
}
