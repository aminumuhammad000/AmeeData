// routes/payment.routes.ts
import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller.js';
import { VTStackController } from '../controllers/vtstack.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import payrantRouter from './payrant.routes.js';
import virtualAccountRouter from './virtualAccount.routes.js';
const router = Router();
// Mount Payrant routes under /payment/payrant
router.use('/payrant', payrantRouter);
// Mount Virtual Account routes under /payment/virtual-account
router.use('/virtual-account', virtualAccountRouter);
/**
 * @route   GET /api/payment/gateway-settings
 * @desc    Get current active payment gateway setting
 * @access  Private
 */
router.get('/gateway-settings', authenticate, PaymentController.getGatewaySettings);
/**
 * @route   POST /api/payment/virtual-account
 * @desc    Create or get user's virtual account
 * @access  Private
 */
router.post('/virtual-account', authenticate, PaymentController.createVirtualAccount);
/**
 * @route   GET /api/payment/virtual-account
 * @desc    Get user's virtual account details
 * @access  Private
 */
router.get('/virtual-account', authenticate, PaymentController.getVirtualAccount);
/**
 * @route   DELETE /api/payment/virtual-account
 * @desc    Deactivate user's virtual account
 * @access  Private
 */
router.delete('/virtual-account', authenticate, PaymentController.deactivateVirtualAccount);
/**
 * @route   POST /api/payment/initiate
 * @desc    Initialize payment for wallet funding (Payrant, Monnify, or Paystack)
 * @access  Private
 * @body    {
 *   amount: number,
 *   gateway?: 'payrant' | 'monnify' | 'paystack',
 *   email?: string (required for Paystack)
 * }
 */
router.post('/initiate', authenticate, PaymentController.initiatePayment);
/**
 * @route   GET /api/payment/verify/:reference
 * @desc    Verify payment status (works for all supported gateways)
 * @access  Private
 */
router.get('/verify/:reference', authenticate, PaymentController.verifyPayment);
/**
 * @route   POST /api/payment/webhook/monnify
 * @desc    Handle Monnify webhook for payment confirmation
 * @access  Public (Webhook from Monnify)
 */
router.post('/webhook/monnify', (req, res) => {
    return PaymentController.handleMonnifyWebhook(req, res);
});
/**
 * @route   POST /api/payment/webhook/paystack
 * @desc    Handle Paystack webhook for payment confirmation
 * @access  Public (Webhook from Paystack)
 */
// Using type assertion to resolve TypeScript error
router.post('/webhook/paystack', (req, res) => {
    return PaymentController.handlePaystackWebhook(req, res);
});
/**
 * @route   GET /api/payment/banks
 * @desc    Get list of supported banks (for bank transfers)
 * @access  Private
 */
router.get('/banks', authenticate, PaymentController.getBanks);
/**
 * @route   POST /api/payment/payrant/create-virtual-account
 * @desc    Create Payrant virtual account for user
 * @access  Private
 */
router.post('/payrant/create-virtual-account', authenticate, PaymentController.createVirtualAccount);
/**
 * @route   GET /api/payment/payrant/virtual-account
 * @desc    Get user's Payrant virtual account
 * @access  Private
 */
router.get('/payrant/virtual-account', authenticate, PaymentController.getVirtualAccount);
/**
 * @route   POST /api/payment/webhook/payrant
 * @desc    Handle Payrant webhook for virtual account deposits
 * @access  Public (Webhook from Payrant)
 */
router.post('/webhook/payrant', (req, res) => {
    return PaymentController.handlePayrantWebhook(req, res);
});
/**
 * @route   POST /api/payment/vtstack/create-virtual-account
 * @desc    Create VTStack virtual account for user
 * @access  Private
 */
router.post('/vtstack/create-virtual-account', authenticate, VTStackController.createAccount);
/**
 * @route   GET /api/payment/vtstack/virtual-account
 * @desc    Get user's VTStack virtual accounts
 * @access  Private
 */
router.get('/vtstack/virtual-account', authenticate, VTStackController.getMyAccounts);
/**
 * @route   GET /api/payment/vtstack/virtual-account/:accountNumber/balance
 * @desc    Get VTStack virtual account balance
 * @access  Private
 */
router.get('/vtstack/virtual-account/:accountNumber/balance', authenticate, VTStackController.getAccountBalance);
/**
 * @route   POST /api/payment/webhook/vtstack
 * @desc    Handle VTStack webhook for virtual account deposits
 * @access  Public (Webhook from VTStack)
 */
router.post('/webhook/vtstack', (req, res) => {
    return VTStackController.webhook(req, res);
});
export default router;
