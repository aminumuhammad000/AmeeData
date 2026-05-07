// services/index.ts
// Central export for all API services

export { adminService } from './admin.service';
export { authService } from './auth.service';
export { notificationsService } from './notifications.service';
export { paymentService } from './payment.service';
export { promotionsService } from './promotions.service';
export { supportService } from './support.service';
export { transactionService } from './transaction.service';
export { userService } from './user.service';
export { vtstackService } from './vtstack.service';
export { walletService } from './wallet.service';

// Re-export types
export type {
  AuthResponse, LoginData, RegisterData
} from './auth.service';

export type {
  UserUpdateData
} from './user.service';

export type {
  WalletData,
  WalletResponse
} from './wallet.service';

export type {
  AirtimePurchaseData,
  DataPurchaseData, Transaction,
  TransactionResponse
} from './transaction.service';

export type {
  PaymentInitiateData,
  PaymentInitiateResponse,
  PaymentVerifyResponse
} from './payment.service';

export type {
  Notification,
  NotificationResponse
} from './notifications.service';

export type {
  Promotion,
  PromotionResponse
} from './promotions.service';

export type {
  CreateTicketData, SupportTicket, TicketResponse
} from './support.service';

export type {
  AdminAuthResponse, AdminLoginData, AdminUser, AuditLog, DashboardStats
} from './admin.service';

// Export API instance and base URL
export { API_BASE_URL, default as api } from './api';

