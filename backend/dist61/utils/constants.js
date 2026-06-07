// ============================================
// UTILS
// ============================================
// utils/constants.ts
export const USER_STATUS = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    SUSPENDED: 'suspended'
};
export const KYC_STATUS = {
    PENDING: 'pending',
    VERIFIED: 'verified',
    REJECTED: 'rejected'
};
export const TRANSACTION_STATUS = {
    PENDING: 'pending',
    SUCCESSFUL: 'successful',
    FAILED: 'failed',
    REFUNDED: 'refunded'
};
export const TRANSACTION_TYPES = {
    AIRTIME_TOPUP: 'airtime_topup',
    DATA_PURCHASE: 'data_purchase',
    BILL_PAYMENT: 'bill_payment',
    WALLET_TOPUP: 'wallet_topup',
    EPIN_PURCHASE: 'e-pin_purchase'
};
export const TICKET_STATUS = {
    NEW: 'new',
    OPEN: 'open',
    PENDING_USER: 'pending_user',
    RESOLVED: 'resolved',
    CLOSED: 'closed'
};
export const TICKET_PRIORITY = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high'
};
