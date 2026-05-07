import airtimeToCashRoutes from './airtime_to_cash.routes.js';
import billPaymentRoutes from './billpayment.routes.js';
import referralRoutes from './referral.routes.js';
export { default as adminRoutes } from './admin.routes.js';
export { default as authRoutes } from './auth.routes.js';
export { default as notificationsRoutes } from './notifications.routes.js';
export { default as promotionsRoutes } from './promotions.routes.js';
export { default as supportRoutes } from './support.routes.js';
export { default as transactionsRoutes } from './transactions.routes.js';
export { default as usersRoutes } from './users.routes.js';
export { default as walletRoutes } from './wallet.routes.js';
import adminRoutes from './admin.routes.js';
import authRoutes from './auth.routes.js';
import notificationsRoutes from './notifications.routes.js';
import promotionsRoutes from './promotions.routes.js';
import supportRoutes from './support.routes.js';
import transactionsRoutes from './transactions.routes.js';
import usersRoutes from './users.routes.js';
import walletRoutes from './wallet.routes.js';
export default (app) => {
    // ... your existing routes
    app.use('/api/v1/auth', authRoutes);
    app.use('/api/v1/users', usersRoutes);
    app.use('/api/v1/wallet', walletRoutes);
    app.use('/api/v1/transactions', transactionsRoutes);
    app.use('/api/v1/notifications', notificationsRoutes);
    app.use('/api/v1/promotions', promotionsRoutes);
    app.use('/api/v1/support', supportRoutes);
    app.use('/api/v1/admin', adminRoutes);
    // Bill payment routes
    app.use('/api/v1/billpayment', billPaymentRoutes);
    // Airtime to Cash routes
    app.use('/api/v1/airtime-to-cash', airtimeToCashRoutes);
    // Referral routes
    app.use('/api/v1/referrals', referralRoutes);
    // Health check
    app.get('/health', (req, res) => {
        res.status(200).json({ status: 'ok', message: 'Server is running' });
    });
};
