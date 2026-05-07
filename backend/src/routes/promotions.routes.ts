import { Router } from 'express';
import { PromotionController } from '../controllers/promotion.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// Promotion routes
router.get('/', authMiddleware, PromotionController.getActivePromotions);
router.post('/', authMiddleware, PromotionController.createPromotion);
router.get('/:id', authMiddleware, PromotionController.getPromotionById);
router.put('/:id', authMiddleware, PromotionController.updatePromotion);
router.delete('/:id', authMiddleware, PromotionController.deletePromotion);

export default router;
