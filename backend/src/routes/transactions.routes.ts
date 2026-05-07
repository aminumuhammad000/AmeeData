import { Router } from 'express';
import { TransactionController } from '../controllers/transaction.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// Transaction routes (protected)
router.post('/', authMiddleware, TransactionController.createTransaction);
router.get('/', authMiddleware, TransactionController.getTransactions);
router.get('/all', authMiddleware, TransactionController.getAllTransactions);
router.get('/:id', authMiddleware, TransactionController.getTransactionById);
router.put('/:id/status', authMiddleware, TransactionController.updateTransactionStatus);

export default router;
