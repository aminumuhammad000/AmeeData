
// controllers/auth.controller.ts
import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config/bootstrap.js';
import { User } from '../models/index.js';
import { EmailService } from '../services/email.service.js';
import { OTPService } from '../services/otp.service.js';
import { WalletService } from '../services/wallet.service.js';
import { ApiResponse } from '../utils/response.js';
import { userValidation } from '../utils/validators.js';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { error } = userValidation.register.validate(req.body);
      if (error) {
        return ApiResponse.error(res, error.details[0].message, 400);
      }

      const { email, phone_number, password, first_name, last_name, referral_code, pin } = req.body;

      const existingUser = await User.findOne({ $or: [{ email }, { phone_number }] });
      if (existingUser) {
        return ApiResponse.error(res, 'User already exists', 400);
      }

      const password_hash = await bcrypt.hash(password, 10);
      const user_referral_code = Math.random().toString(36).substring(2, 10).toUpperCase();

      let referred_by;
      if (referral_code) {
        const referrer = await User.findOne({ referral_code });
        referred_by = referrer?._id;
      }

      const user = await User.create({
        email,
        phone_number,
        password_hash,
        first_name,
        last_name,
        referral_code: user_referral_code,
        referred_by,
        country: 'Nigeria',
        profile_picture: `https://api.dicebear.com/7.x/initials/svg?seed=${first_name}+${last_name}`,
        kyc_status: 'pending',
        status: 'active',
        transaction_pin: pin ? await bcrypt.hash(String(pin), 10) : undefined
      });

      await WalletService.createWallet(user._id);
      await OTPService.createOTP(phone_number, email, user._id.toString());

      const token = jwt.sign({ id: user._id }, config.jwtSecret as string, { expiresIn: config.jwtExpiry } as SignOptions);

      return ApiResponse.success(res, { user, token }, 'Registration successful', 201);
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 500);
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { error } = userValidation.login.validate(req.body);
      if (error) {
        return ApiResponse.error(res, error.details[0].message, 400);
      }

      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return ApiResponse.error(res, 'Invalid credentials', 401);
      }

      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        return ApiResponse.error(res, 'Invalid credentials', 401);
      }

      if (user.status !== 'active') {
        return ApiResponse.error(res, 'Account is inactive', 403);
      }

      const token = jwt.sign({ id: user._id }, config.jwtSecret as string, { expiresIn: config.jwtExpiry } as SignOptions);

      return ApiResponse.success(res, { user, token }, 'Login successful');
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 500);
    }
  }

  static async verifyOTP(req: Request, res: Response) {
    try {
      const { phone_number, otp_code } = req.body;

      const isValid = await OTPService.verifyOTP(phone_number, otp_code);
      if (!isValid) {
        return ApiResponse.error(res, 'Invalid or expired OTP', 400);
      }

      return ApiResponse.success(res, null, 'OTP verified successfully');
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 500);
    }
  }

  static async resendOTP(req: Request, res: Response) {
    try {
      const { phone_number, email } = req.body;

      let identifier = phone_number || email;
      if (!identifier) {
        return ApiResponse.error(res, 'Phone number or email is required', 400);
      }

      let userEmail = email;
      if (phone_number && !userEmail) {
        const user = await User.findOne({ phone_number });
        if (user) {
          userEmail = user.email;
        }
      }

      const otp_code = await OTPService.createOTP(identifier, userEmail);

      return ApiResponse.success(res, null, 'OTP sent successfully');
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 500);
    }
  }

  static async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        return ApiResponse.error(res, 'User not found', 404);
      }

      // Generate OTP for email (using email as identifier)
      const otp = await OTPService.createOTP(email, email, user._id.toString());

      // Send OTP via Email
      await EmailService.sendOtpEmail(email, otp);

      return ApiResponse.success(res, null, 'OTP sent to your email');
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 500);
    }
  }

  static async verifyEmailOTP(req: Request, res: Response) {
    try {
      const { email, otp_code } = req.body;
      const isValid = await OTPService.verifyOTP(email, otp_code);
      if (!isValid) {
        return ApiResponse.error(res, 'Invalid or expired OTP', 400);
      }
      return ApiResponse.success(res, null, 'OTP verified successfully');
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 500);
    }
  }

  static async resetPassword(req: Request, res: Response) {
    try {
      const { email, otp_code, new_password } = req.body;

      const isValid = await OTPService.verifyOTP(email, otp_code);
      if (!isValid) {
        return ApiResponse.error(res, 'Invalid or expired OTP', 400);
      }

      const hash = await bcrypt.hash(new_password, 10);
      await User.findOneAndUpdate({ email }, { password_hash: hash });

      return ApiResponse.success(res, null, 'Password reset successfully');
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 500);
    }
  }
}