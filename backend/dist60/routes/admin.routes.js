import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller.js';
import AdminFundingController from '../controllers/admin_funding.controller.js';
import AdminPricingController from '../controllers/admin_pricing.controller.js';
import AdminProviderController from '../controllers/admin_provider.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
const router = Router();
// Admin routes
router.post('/login', AdminController.login);
router.get('/dashboard', authMiddleware, AdminController.getDashboardStats);
// Admin profile
router.put('/profile', authMiddleware, AdminController.updateAdminProfile);
router.put('/profile/password', authMiddleware, AdminController.changeAdminPassword);
// Admin user management
router.post('/admins', authMiddleware, AdminController.createAdminUser);
router.get('/admins', authMiddleware, AdminController.getAllAdmins); // Keeping this as it's not explicitly removed
router.get('/roles', authMiddleware, AdminController.getRoles);
// User management
router.get('/users', authMiddleware, AdminController.getAllUsers);
router.get('/users/:id', authMiddleware, AdminController.getUserById);
router.put('/users/:id/status', authMiddleware, AdminController.updateUserStatus);
router.put('/users/:id', authMiddleware, AdminController.updateUser);
router.delete('/users/:id', authMiddleware, AdminController.deleteUser);
router.post('/users/:id/api-key', authMiddleware, AdminController.generateApiKey);
router.delete('/users/:id/api-key', authMiddleware, AdminController.revokeApiKey);
// Pricing Management for Developers
router.get('/plans', authMiddleware, AdminController.getPlans);
router.put('/plans/:id/developer-price', authMiddleware, AdminController.updatePlanDeveloperPrice);
// Wallet management
router.post('/wallet/credit', authMiddleware, AdminController.creditUserWallet);
// Audit logs
router.get('/audit-logs', authMiddleware, AdminController.getAuditLogs);
router.delete('/audit-logs/:id', authMiddleware, AdminController.deleteAuditLog);
// Pricing management
router.get('/pricing', authMiddleware, AdminPricingController.getAllPlans);
router.get('/pricing/provider/:providerId', authMiddleware, AdminPricingController.getPlansByProvider);
router.get('/pricing/:id', authMiddleware, AdminPricingController.getPlanById);
router.post('/pricing', authMiddleware, AdminPricingController.createPlan);
router.put('/pricing/:id', authMiddleware, AdminPricingController.updatePlan);
router.delete('/pricing/:id', authMiddleware, AdminPricingController.deletePlan);
router.post('/pricing/bulk-import', authMiddleware, AdminPricingController.bulkImportPlans);
// Provider balances (place BEFORE parameterized provider routes)
router.get('/providers/balances', authMiddleware, AdminFundingController.getProviderBalances);
// Provider testing routes (place BEFORE parameterized provider routes)
router.post('/providers/test/:code', authMiddleware, AdminProviderController.testConnection);
router.post('/providers/test-purchase/:code', authMiddleware, AdminProviderController.testPurchase);
router.get('/providers/data/:code', authMiddleware, AdminProviderController.getProviderData);
// Provider management
router.get('/providers', authMiddleware, AdminProviderController.list);
router.get('/providers/:id', authMiddleware, AdminProviderController.getById);
router.post('/providers', authMiddleware, AdminProviderController.create);
router.put('/providers/:id', authMiddleware, AdminProviderController.update);
router.delete('/providers/:id', authMiddleware, AdminProviderController.remove);
router.get('/providers/:id/env', authMiddleware, AdminProviderController.getEnv);
router.put('/providers/:id/env', authMiddleware, AdminProviderController.updateEnv);
// Funding info
router.get('/funding/info', authMiddleware, AdminFundingController.getFundingInfo);
router.get('/funding/accounts', authMiddleware, AdminFundingController.listAccounts);
router.post('/funding/accounts', authMiddleware, AdminFundingController.createAccount);
router.put('/funding/accounts/:id', authMiddleware, AdminFundingController.updateAccount);
router.delete('/funding/accounts/:id', authMiddleware, AdminFundingController.deleteAccount);
// Support content management
router.get('/support-content', authMiddleware, async (req, res, next) => {
    const { SupportContentController } = await import('../controllers/support_content.controller.js');
    return SupportContentController.getContent(req, res);
});
router.put('/support-content', authMiddleware, async (req, res, next) => {
    const { SupportContentController } = await import('../controllers/support_content.controller.js');
    return SupportContentController.updateContent(req, res);
});
// Broadcast Notifications
router.post('/notifications/broadcast', authMiddleware, async (req, res) => {
    const { NotificationController } = await import('../controllers/notification.controller.js');
    return NotificationController.sendBroadcastNotification(req, res);
});
router.delete('/notifications/broadcast/:id', authMiddleware, async (req, res) => {
    const { NotificationController } = await import('../controllers/notification.controller.js');
    return NotificationController.deleteBroadcast(req, res);
});
router.get('/notifications/broadcast', authMiddleware, async (req, res) => {
    const { NotificationController } = await import('../controllers/notification.controller.js');
    return NotificationController.getBroadcasts(req, res);
});
router.put('/notifications/broadcast/:id', authMiddleware, async (req, res) => {
    const { NotificationController } = await import('../controllers/notification.controller.js');
    return NotificationController.updateBroadcast(req, res);
});
router.post('/notifications/email', authMiddleware, async (req, res) => {
    const { NotificationController } = await import('../controllers/notification.controller.js');
    return NotificationController.sendEmailNotification(req, res);
});
// System Settings (Payment Gateway, Notification Email, etc.)
router.get('/settings', authMiddleware, async (req, res) => {
    const { SystemSettingsController } = await import('../controllers/system_settings.controller.js');
    return SystemSettingsController.getSettings(req, res);
});
router.put('/settings', authMiddleware, async (req, res) => {
    const { SystemSettingsController } = await import('../controllers/system_settings.controller.js');
    return SystemSettingsController.updateSettings(req, res);
});
// Airtime to Cash
router.get('/airtime-to-cash/requests', authMiddleware, async (req, res) => {
    const { AdminAirtimeToCashController } = await import('../controllers/admin_airtime_to_cash.controller.js');
    return AdminAirtimeToCashController.getRequests(req, res);
});
router.put('/airtime-to-cash/requests/:id', authMiddleware, async (req, res) => {
    const { AdminAirtimeToCashController } = await import('../controllers/admin_airtime_to_cash.controller.js');
    return AdminAirtimeToCashController.updateRequestStatus(req, res);
});
router.get('/airtime-to-cash/settings', authMiddleware, async (req, res) => {
    const { AdminAirtimeToCashController } = await import('../controllers/admin_airtime_to_cash.controller.js');
    return AdminAirtimeToCashController.getSettings(req, res);
});
router.post('/airtime-to-cash/settings', authMiddleware, async (req, res) => {
    const { AdminAirtimeToCashController } = await import('../controllers/admin_airtime_to_cash.controller.js');
    return AdminAirtimeToCashController.createSetting(req, res);
});
router.put('/airtime-to-cash/settings/:id', authMiddleware, async (req, res) => {
    const { AdminAirtimeToCashController } = await import('../controllers/admin_airtime_to_cash.controller.js');
    return AdminAirtimeToCashController.updateSetting(req, res);
});
export default router;
