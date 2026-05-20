import { User } from '../models/index.js';
import { ApiResponse } from '../utils/response.js';
export class AnalyticsController {
    /**
     * Get transaction leaderboard (now including all users)
     * @route GET /api/admin/analytics/leaderboard
     */
    static async getLeaderboard(req, res) {
        try {
            const period = req.query.period || 'monthly';
            const now = new Date();
            let startDate = new Date();
            switch (period) {
                case 'daily':
                    startDate.setHours(0, 0, 0, 0);
                    break;
                case 'weekly':
                    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    break;
                case 'monthly':
                    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    break;
                case 'all-time':
                    startDate = new Date(0);
                    break;
                default:
                    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            }
            const leaderboard = await User.aggregate([
                {
                    $lookup: {
                        from: 'transactions',
                        let: { userId: '$_id' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ['$user_id', '$$userId'] },
                                            { $eq: ['$status', 'successful'] },
                                            { $gte: ['$created_at', startDate] }
                                        ]
                                    }
                                }
                            },
                            {
                                $group: {
                                    _id: null,
                                    totalSpent: { $sum: '$amount' },
                                    transactionCount: { $sum: 1 }
                                }
                            }
                        ],
                        as: 'stats'
                    }
                },
                {
                    $project: {
                        _id: 1,
                        first_name: 1,
                        last_name: 1,
                        email: 1,
                        phone_number: 1,
                        stats: { $arrayElemAt: ['$stats', 0] }
                    }
                },
                {
                    $project: {
                        _id: 1,
                        'user.first_name': '$first_name',
                        'user.last_name': '$last_name',
                        'user.email': '$email',
                        'user.phone_number': '$phone_number',
                        totalSpent: { $ifNull: ['$stats.totalSpent', 0] },
                        transactionCount: { $ifNull: ['$stats.transactionCount', 0] }
                    }
                },
                { $sort: { totalSpent: -1, transactionCount: -1 } }
            ]);
            return ApiResponse.success(res, leaderboard, `Leaderboard (${period}) retrieved successfully`);
        }
        catch (error) {
            console.error('Leaderboard Error:', error);
            return ApiResponse.error(res, error.message, 500);
        }
    }
}
