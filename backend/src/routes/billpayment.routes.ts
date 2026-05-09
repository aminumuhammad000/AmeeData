// routes/billpayment.routes.ts
import { Router } from 'express';
import billPaymentController from '../controllers/billpayment.controller.js';
import { apiKeyMiddleware } from '../middleware/apiKey.middleware.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// All routes require authentication (either JWT or API Key)
router.use(apiKeyMiddleware);
router.use(authMiddleware);

// Test endpoint to verify authentication
router.get('/test-auth', (req: any, res) => {
    res.json({
        success: true,
        message: 'Authentication successful',
        user: {
            id: req.user?.id,
            email: req.user?.email
        }
    });
});

// Balance
router.get('/balance', billPaymentController.getBalance);

// Get service data
router.get('/networks', billPaymentController.getNetworks);
router.get('/data-plans', billPaymentController.getDataPlans);
router.get('/plans', billPaymentController.getDeveloperPlans);


// Airtime
router.post('/airtime', billPaymentController.purchaseAirtime);

// Data
router.post('/data', billPaymentController.purchaseData);



// Transaction status
router.get('/transaction/:reference', billPaymentController.getTransactionStatus);

export default router;