import { AxiosResponse } from 'axios';

// Base API Response
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
}

// User related types
export interface User {
  _id: string;
  email: string;
  phone_number: string;
  first_name: string;
  last_name: string;
  referral_code: string;
  kyc_status: 'pending' | 'verified' | 'rejected';
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
}

export interface Wallet {
  balance: number;
  currency: string;
  userId: string;
}

export interface Transaction {
  _id: string;
  type: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  reference: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Bill Payment related types
export interface BillPaymentResponse {
  status: 'success' | 'failed' | 'pending';
  message: string;
  reference: string;
  amount: number;
  network?: string;
  phone?: string;
  planId?: string;
  smartCardNumber?: string;
  package?: string;
  meterNumber?: string;
  meterType?: 'prepaid' | 'postpaid';
  transactionId?: string;
  timestamp: string;
}

// Admin Service specific types
// Create a base user interface with optional fields for admin
interface BaseAdminUser {
  _id: string;
  email: string;
  phone_number?: string;
  first_name?: string;
  last_name?: string;
  referral_code?: string;
  kyc_status?: 'pending' | 'verified' | 'rejected';
  status?: 'active' | 'inactive' | 'suspended';
  created_at?: string;
  updated_at?: string;
  role: string;
  wallet?: Wallet;
}

export type AdminUser = BaseAdminUser;

// Network and Data Plan types
export type Network = 'mtn' | 'glo' | 'airtel' | '9mobile' | 'mtn-corporate' | 'airtel-corporate';

export interface DataPlan {
  id: string;
  network: Network;
  plan: string;
  amount: number;
  validity: string;
  description?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  details: Record<string, any>;
  ipAddress: string;
  timestamp: string;
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalTransactions: number;
  totalRevenue: number;
  recentTransactions: Transaction[];
}

export interface AdminService {
  // Auth
  adminLogin(credentials: { email: string; password: string }): Promise<AxiosResponse<ApiResponse<{ 
    token: string;
    admin: AdminUser;
  }>>>;
  
  // Dashboard
  getDashboardStats(): Promise<AxiosResponse<ApiResponse<DashboardStats>>>;
  
  // Users
  getUsers(params?: { 
    page?: number; 
    limit?: number; 
    search?: string; 
    status?: string;
  }): Promise<AxiosResponse<ApiResponse<PaginatedResponse<AdminUser>>>>;
  
  getUser(id: string): Promise<AxiosResponse<ApiResponse<{ user: AdminUser }>>>;
  
  updateUser(id: string, userData: Partial<User>): Promise<AxiosResponse<ApiResponse<{ user: User }>>>;
  
  updateUserStatus(id: string, status: 'active' | 'inactive' | 'suspended'): Promise<AxiosResponse<ApiResponse>>;
  
  deleteUser(id: string): Promise<AxiosResponse<ApiResponse>>;
  
  // Audit Logs
  getAuditLogs(params?: { 
    page?: number; 
    limit?: number; 
    action?: string;
    userId?: string;
  }): Promise<AxiosResponse<ApiResponse<PaginatedResponse<AuditLog>>>>;
  
  deleteAuditLog(id: string): Promise<AxiosResponse<ApiResponse>>;
}
