import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// Notification routes (protected)
router.get('/', authMiddleware, NotificationController.getNotifications);
router.get('/:id', authMiddleware, NotificationController.getNotificationById);
router.put('/:id/read', authMiddleware, NotificationController.markAsRead);
router.put('/read-all', authMiddleware, NotificationController.markAllAsRead);
router.delete('/:id', authMiddleware, NotificationController.deleteNotification);
router.delete('/', authMiddleware, NotificationController.deleteAllNotifications);

export default router;
