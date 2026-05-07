import express from 'express';
import { AirtimeToCashController } from '../controllers/airtime_to_cash.controller.js';
import { authenticate } from '../middleware/auth.middleware.js'; // Assuming generic auth middleware

const router = express.Router();

router.post('/submit', authenticate, AirtimeToCashController.submitRequest);
router.get('/history', authenticate, AirtimeToCashController.getMyRequests);
router.get('/settings', AirtimeToCashController.getSettings);

export default router;
