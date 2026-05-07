import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

export interface RegisterData {
  email: string;
  phone_number: string;
  password: string;
  first_name: string;
  last_name: string;
  referral_code?: string;
  pin?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: {
      _id: string;
      email: string;
      phone_number: string;
      first_name: string;
      last_name: string;
      referral_code: string;
      kyc_status: string;
      status: string;
      biometric_enabled: boolean;
      country: string;
      created_at: string;
      updated_at: string;
    };
    token: string;
  };
  message: string;
}

export const authService = {
  /**
   * Register a new user
   */
  register: async (data: RegisterData): Promise<AuthResponse> => {
    try {
      console.log('📤 Sending registration request to backend:', data);
      const response = await api.post<AuthResponse>('/auth/register', data);
      console.log('✅ Registration response:', response.data);

      // Save token and user data
      if (response.data.success && response.data.data.token) {
        await AsyncStorage.setItem('authToken', response.data.data.token);
        await AsyncStorage.setItem('user', JSON.stringify(response.data.data.user));
      }

      return response.data;
    } catch (error: any) {
      console.error('❌ Registration error:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      throw { success: false, message: errorMessage, ...error.response?.data };
    }
  },

  /**
   * Login user
   */
  login: async (data: LoginData): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>('/auth/login', data);

      // Save token and user data
      if (response.data.success && response.data.data.token) {
        await AsyncStorage.setItem('authToken', response.data.data.token);
        await AsyncStorage.setItem('user', JSON.stringify(response.data.data.user));
      }

      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Login failed' };
    }
  },

  /**
   * Verify OTP
   */
  verifyOTP: async (phone_number: string, otp_code: string): Promise<any> => {
    try {
      const response = await api.post('/auth/verify-otp', {
        phone_number,
        otp_code,
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'OTP verification failed' };
    }
  },

  /**
   * Resend OTP
   */
  resendOTP: async (phone_number: string, email?: string): Promise<any> => {
    try {
      const response = await api.post('/auth/resend-otp', {
        phone_number,
        email,
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Failed to resend OTP' };
    }
  },

  /**
   * Request password reset via email (send OTP to email)
   */
  requestPasswordReset: async (data: { email: string }): Promise<any> => {
    try {
      const response = await api.post('/auth/forgot-password', data);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Failed to request password reset' };
    }
  },

  /**
   * Verify OTP sent to email
   */
  verifyEmailOTP: async (data: { email: string; otp_code: string }): Promise<any> => {
    try {
      const response = await api.post('/auth/verify-email-otp', data);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'OTP verification failed' };
    }
  },

  /**
   * Reset password with OTP
   */
  resetPassword: async (data: { email: string; otp_code: string; new_password: string }): Promise<any> => {
    try {
      const response = await api.post('/auth/reset-password', data);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Password reset failed' };
    }
  },

  /**
   * Logout user
   */
  logout: async (): Promise<void> => {
    // Clear tokens and user data from storage
    await AsyncStorage.multiRemove(['authToken', 'user']);

    // Clear any API authorization headers
    if (api.defaults.headers.common['Authorization']) {
      delete api.defaults.headers.common['Authorization'];
    }

    // Clear any other cached data if needed
    await AsyncStorage.multiRemove(['walletData', 'transactions', 'profileData']);
  },

  /**
   * Get current user from storage
   */
  getCurrentUser: async (): Promise<any | null> => {
    try {
      const userString = await AsyncStorage.getItem('user');
      return userString ? JSON.parse(userString) : null;
    } catch (error) {
      return null;
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: async (): Promise<boolean> => {
    const token = await AsyncStorage.getItem('authToken');
    return !!token;
  },
};
