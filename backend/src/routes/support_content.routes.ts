import { Router } from 'express';
import { SupportContentController } from '../controllers/support_content.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = Router();

// Public route to get support content
router.get('/', SupportContentController.getContent);

// Admin route to update support content
router.put('/', authenticate, authorize(['admin', 'super_admin']), SupportContentController.updateContent);

export default router;
