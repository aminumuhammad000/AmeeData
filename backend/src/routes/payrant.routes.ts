// routes/payrant.routes.ts
import { Router } from 'express';
import { PayrantController } from '../controllers/payrant.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

/**
 * @route   POST /api/payment/payrant/create-virtual-account
 * @desc    Create a new Payrant virtual account
 * @access  Private (requires authentication)
 * @body    {
 *   documentType: 'nin' | 'bvn',
 *   documentNumber: string,
 *   virtualAccountName?: string,
 *   customerName?: string,
 *   email?: string,
 *   accountReference?: string
 * }
 */
router.post('/create-virtual-account', authenticate, PayrantController.createVirtualAccount);

/**
 * @route   GET /api/payment/payrant/virtual-account
 * @desc    Get user's virtual account details
 * @access  Private (requires authentication)
 */
router.get('/virtual-account', authenticate, PayrantController.getVirtualAccount);

/**
 * @route   POST /api/payment/payrant/webhook
 * @desc    Handle Payrant webhook events
 * @access  Public (called by Payrant)
 * @headers x-payrant-signature: string (signature for webhook verification)
 */
router.post('/webhook', PayrantController.handleWebhook);

/**
 * @route   POST /api/payment/payrant/initialize-checkout
 * @desc    Initialize a new payment checkout
 * @access  Private (requires authentication)
 * @body    {
 *   amount: number,
 *   email: string,
 *   callback_url?: string,
 *   metadata?: Record<string, any>
 * }
 */
router.post('/initialize-checkout', authenticate, PayrantController.initializeCheckout);

export default router;
