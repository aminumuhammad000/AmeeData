import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import adminRoutes from "./routes/admin.routes.js";
import airtimeToCashRoutes from "./routes/airtime_to_cash.routes.js";
import authRoutes from "./routes/auth.routes.js";
import billpaymentRoutes from "./routes/billpayment.routes.js";
import notificationsRoutes from "./routes/notifications.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import promotionsRoutes from "./routes/promotions.routes.js";
import referralRoutes from "./routes/referral.routes.js";
import supportRoutes from "./routes/support.routes.js";
import supportContentRoutes from "./routes/support_content.routes.js";
import transactionsRoutes from "./routes/transactions.routes.js";
import usersRoutes from "./routes/users.routes.js";
import virtualAccountRoutes from "./routes/virtualAccount.routes.js";
import walletRoutes from "./routes/wallet.routes.js";
// Import logging middleware
import { logger } from "./config/bootstrap.js";
import { detailedRequestLogger, errorLogger, requestLogger } from "./middleware/logger.middleware.js";
dotenv.config();
const app = express();
// CORS Configuration - Allow ALL origins
app.use(cors()); // Allow all origins (default)
app.use(['/api/payment/webhook', '/api/payment/payrant/webhook'], express.raw({ type: 'application/json' }));
// Parse JSON for all other routes
app.use(express.json());
// ============================================
// LOGGING MIDDLEWARE
// ============================================
// Log all incoming requests with details
app.use(detailedRequestLogger);
// Morgan logger for standard HTTP request logging
app.use(requestLogger);
logger.info('🚀 AmeeData Backend Starting...', {
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version
});
// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/transactions", transactionsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/promotions", promotionsRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/billpayment", billpaymentRoutes);
app.use("/api/support-content", supportContentRoutes);
app.use("/api/referrals", referralRoutes);
app.use("/api/virtual-accounts", virtualAccountRoutes);
app.use("/api/airtime-to-cash", airtimeToCashRoutes);
// Root route
app.get("/", (req, res) => {
    res.send("✅ AmeeData Backend is running...");
});
// Health check
app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok", message: "Server is running" });
});
// Test TopUpMate service
app.get("/api/test-topupmate", async (req, res) => {
    try {
        const { default: topupmateService } = await import("./services/topupmate.service.js");
        const networks = await topupmateService.getNetworks();
        res.json({ success: true, message: "TopUpMate service is working!", data: networks });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "TopUpMate service error", error: error.message });
    }
});
// ============================================
// ERROR HANDLING
// ============================================
// Log errors
app.use(errorLogger);
// Global error handler
app.use((err, req, res, next) => {
    logger.error("❌ Unhandled Error:", {
        error: {
            name: err.name,
            message: err.message,
            stack: err.stack
        },
        url: req.originalUrl,
        method: req.method,
        ip: req.ip
    });
    // Log to console for immediate visibility
    console.error('\n🔴 ERROR DETAILS:');
    console.error('Message:', err.message);
    console.error('Stack:', err.stack);
    console.error('\n');
    res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: err.message, // Always show error message for debugging
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});
export default app;
