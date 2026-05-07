import { Router } from 'express';
import { body } from 'express-validator';
import { 
  createOrUpdateVirtualAccount, 
  getUserVirtualAccount,
  deactivateVirtualAccount 
} from '../controllers/virtualAccount.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Get user's virtual account
router.get('/', getUserVirtualAccount);

// Create or update virtual account
router.post(
  '/',
  [
    body('accountNumber').notEmpty().withMessage('Account number is required'),
    body('accountName').notEmpty().withMessage('Account name is required'),
    body('reference').notEmpty().withMessage('Reference is required'),
    body('provider').optional().isIn(['payrant', 'monnify', 'flutterwave']),
    body('status').optional().isIn(['active', 'inactive', 'suspended']),
  ],
  createOrUpdateVirtualAccount
);

// Deactivate virtual account
router.delete('/', deactivateVirtualAccount);

export default router;
