// controllers/promotion.controller.ts
import { Response } from 'express';
import { Promotion } from '../models/index.js';
import { ApiResponse } from '../utils/response.js';
import { AuthRequest } from '../types/index.js';

export class PromotionController {
  static async getActivePromotions(req: AuthRequest, res: Response) {
    try {
      const promotions = await Promotion.find({
        status: 'active',
        start_date: { $lte: new Date() },
        end_date: { $gte: new Date() }
      }).sort({ created_at: -1 });

      return ApiResponse.success(res, promotions, 'Promotions retrieved successfully');
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 500);
    }
  }

  static async createPromotion(req: AuthRequest, res: Response) {
    try {
      const promotion = await Promotion.create(req.body);
      return ApiResponse.success(res, promotion, 'Promotion created successfully', 201);
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 500);
    }
  }

  static async updatePromotion(req: AuthRequest, res: Response) {
    try {
      const promotion = await Promotion.findByIdAndUpdate(
        req.params.id,
        { ...req.body, updated_at: new Date() },
        { new: true }
      );

      if (!promotion) {
        return ApiResponse.error(res, 'Promotion not found', 404);
      }

      return ApiResponse.success(res, promotion, 'Promotion updated successfully');
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 500);
    }
  }

  static async getPromotionById(req: AuthRequest, res: Response) {
    try {
      const promotion = await Promotion.findById(req.params.id);
      if (!promotion) {
        return ApiResponse.error(res, 'Promotion not found', 404);
      }

      return ApiResponse.success(res, promotion, 'Promotion retrieved successfully');
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 500);
    }
  }

  static async deletePromotion(req: AuthRequest, res: Response) {
    try {
      const promotion = await Promotion.findByIdAndDelete(req.params.id);
      if (!promotion) {
        return ApiResponse.error(res, 'Promotion not found', 404);
      }

      return ApiResponse.success(res, null, 'Promotion deleted successfully');
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 500);
    }
  }
}
