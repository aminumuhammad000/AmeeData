import { Router } from 'express';
import { ReferralController } from '../controllers/referral.controller.js';
import { authMiddleware, authorize } from '../middleware/auth.middleware.js';

const router = Router();

// User routes
router.get('/stats', authMiddleware, ReferralController.getUserReferralStats);
router.get('/settings', authMiddleware, ReferralController.getReferralSettings);

// Admin routes
router.get('/admin/stats', authMiddleware, authorize(['admin']), ReferralController.getAdminReferralStats);
router.put('/admin/settings', authMiddleware, authorize(['admin']), ReferralController.updateReferralSettings);

export default router;
