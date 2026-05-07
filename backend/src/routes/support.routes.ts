import { Router } from 'express';
import { SupportController } from '../controllers/support.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// Support routes (protected)
router.post('/', authMiddleware, SupportController.createTicket);
router.get('/', authMiddleware, SupportController.getTickets);
router.get('/all', authMiddleware, SupportController.getAllTickets);
router.get('/:id', authMiddleware, SupportController.getTicketById);
router.put('/:id/status', authMiddleware, SupportController.updateTicketStatus);
router.put('/:id', authMiddleware, SupportController.updateTicket);
router.delete('/:id', authMiddleware, SupportController.deleteTicket);

export default router;
