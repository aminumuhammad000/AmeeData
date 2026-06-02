import { Router } from 'express';
import { CareController } from '../controllers/care.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
const router = Router();
router.use(authMiddleware);
router.get('/circle', CareController.getCircle);
router.post('/circle', CareController.addMember);
router.patch('/circle/:id', CareController.updateMember);
router.delete('/circle/:id', CareController.removeMember);
router.get('/stats/:member_id', CareController.getStats);
// Care Requests
router.post('/request', CareController.requestCare);
router.post('/request/respond', CareController.respondToRequest);
router.get('/requests', CareController.getRequests);
router.get('/purposes', CareController.getPurposes);
export default router;
