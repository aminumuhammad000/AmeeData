import { Request } from 'express';
import { Document, Types } from 'mongoose';

export interface IVirtualAccount {
  account_number: string;
  account_name: string;
  bank_name: string;
  account_reference: string;
  provider: string;
  status: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  phone_number: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  // CamelCase aliases used across the codebase
  firstName?: string;
  lastName?: string;
  date_of_birth?: Date;
  address?: string;
  city?: string;
  state?: string;
  country: string;
  profile_picture?: string;
  kyc_status: 'pending' | 'verified' | 'rejected';
  kyc_document_id_front_url?: string;
  kyc_document_id_back_url?: string;
  referral_code: string;
  referred_by?: Types.ObjectId;
  biometric_enabled: boolean;
  virtual_account?: IVirtualAccount;
  status: 'active' | 'inactive' | 'suspended';
  created_at: Date;
  updated_at: Date;
  nin?: string;
  bvn?: string;
  transaction_pin?: string;
  api_key?: string;
  api_key_enabled?: boolean;
}

export interface IWallet extends Document {
  _id: Types.ObjectId;
  user_id: Types.ObjectId;
  // camelCase alias
  userId?: Types.ObjectId;
  balance: number;
  currency: string;
  last_transaction_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface ITransaction extends Document {
  _id: Types.ObjectId;
  user_id: Types.ObjectId;
  // camelCase alias
  user?: any;
  wallet_id: Types.ObjectId;
  type: 'airtime_topup' | 'data_purchase' | 'bill_payment' | 'wallet_topup' | 'e-pin_purchase' | 'credit' | 'airtime' | 'data' | 'cable' | 'electricity' | 'exampin' | 'e-pin';
  amount: number;
  fee: number;
  total_charged: number;
  status: 'pending' | 'successful' | 'failed' | 'refunded' | 'success';
  reference_number: string;
  description?: string;
  payment_method: string;
  destination_account?: string;
  operator_id?: Types.ObjectId;
  plan_id?: Types.ObjectId;
  receipt_url?: string;
  error_message?: string;
  created_at: Date;
  updated_at: Date;
  metadata?: any;
  gateway?: string;
}

export interface IOperator extends Document {
  _id: Types.ObjectId;
  name: string;
  code: string;
  logo_url?: string;
  status: 'active' | 'inactive';
  created_at: Date;
  updated_at: Date;
}

export interface IPlan extends Document {
  _id: Types.ObjectId;
  operator_id: Types.ObjectId;
  name: string;
  price: number;
  developer_price?: number;
  validity: string;
  data_amount?: string;
  type: 'data' | 'airtime';
  status: 'active' | 'inactive';
  created_at: Date;
  updated_at: Date;
}

export interface IBiller extends Document {
  _id: Types.ObjectId;
  name: string;
  category: string;
  logo_url?: string;
  api_endpoint?: string;
  status: 'active' | 'inactive';
  created_at: Date;
  updated_at: Date;
}

export interface IEPinProduct extends Document {
  _id: Types.ObjectId;
  name: string;
  value: number;
  status: 'active' | 'inactive';
  created_at: Date;
  updated_at: Date;
}

export interface IEPin extends Document {
  _id: Types.ObjectId;
  e_pin_product_id: Types.ObjectId;
  transaction_id: Types.ObjectId;
  pin_code: string;
  serial_number: string;
  status: 'available' | 'used' | 'expired';
  purchased_at: Date;
  used_at?: Date;
}

export interface IAdminUser extends Document {
  _id: Types.ObjectId;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  role_id: Types.ObjectId;
  last_login_at?: Date;
  status: 'active' | 'inactive';
  created_at: Date;
  updated_at: Date;
}

export interface IAdminRole extends Document {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  permissions?: string[];
  status?: 'active' | 'inactive';
  created_at: Date;
  updated_at: Date;
}

export interface IAdminPermission extends Document {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  created_at: Date;
  updated_at: Date;
}

export interface IRolePermission extends Document {
  _id: Types.ObjectId;
  role_id: Types.ObjectId;
  permission_id: Types.ObjectId;
}

export interface IOTP extends Document {
  _id: Types.ObjectId;
  user_id?: Types.ObjectId;
  phone_number: string;
  email?: string;
  otp_code: string;
  expires_at: Date;
  is_used: boolean;
  created_at: Date;
}

export interface INotification extends Document {
  _id: Types.ObjectId;
  user_id?: Types.ObjectId;
  type: string;
  title: string;
  message: string;
  read_status: boolean;
  created_at: Date;
  action_link?: string;
}

export interface IPromotion extends Document {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  type: 'discount' | 'cashback' | 'referral_bonus';
  start_date: Date;
  end_date: Date;
  code?: string;
  status: 'active' | 'inactive' | 'ended';
  target_users: string;
  banner_image_url?: string;
  created_at: Date;
  updated_at: Date;
}

export interface IReferralSetting extends Document {
  _id: Types.ObjectId;
  referrer_bonus_amount: number;
  referee_bonus_amount: number;
  min_transaction_for_bonus: number;
  terms_and_conditions_url?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ISupportTicket extends Document {
  _id: Types.ObjectId;
  user_id?: Types.ObjectId;
  admin_id?: Types.ObjectId;
  subject: string;
  description: string;
  status: 'new' | 'open' | 'pending_user' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  created_at: Date;
  updated_at: Date;
}

export interface IAuditLog extends Document {
  _id: Types.ObjectId;
  admin_id?: Types.ObjectId;
  user_id?: Types.ObjectId;
  action: string;
  entity_type: string;
  entity_id?: Types.ObjectId;
  old_value?: any;
  new_value?: any;
  ip_address?: string;
  timestamp: Date;
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email?: string;
    role?: string;
  };
}
