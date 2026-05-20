import { Router } from 'express';
import { WalletController } from '../controllers/wallet.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
const router = Router();
// Wallet routes (protected)
router.get('/', authMiddleware, WalletController.getWallet);
router.get('/transactions', authMiddleware, WalletController.getWalletTransactions);
router.post('/transfer', authMiddleware, WalletController.transferFunds);
router.post('/care-transfer', authMiddleware, WalletController.transferCareBalance);
export default router;
