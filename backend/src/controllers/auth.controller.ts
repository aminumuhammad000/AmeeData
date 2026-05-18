
// controllers/auth.controller.ts
import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config/bootstrap.js';
import { User } from '../models/index.js';
import { SupportContent } from '../models/support_content.model.js';
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
        profile_picture: `https://i.pravatar.cc/300?u=${email}`,
        kyc_status: 'pending',
        status: 'active',
        transaction_pin: pin ? await bcrypt.hash(String(pin), 10) : undefined
      });

      await WalletService.createWallet(user._id);
      await OTPService.createOTP(phone_number, email, user._id.toString());

      const token = jwt.sign({ id: user._id }, config.jwtSecret as string, { expiresIn: config.jwtExpiry } as SignOptions);

      // Fetch support content to get WhatsApp link and customer support phone number
      const supportContent = await SupportContent.findOne();
      const whatsappGroupLink = 'https://chat.whatsapp.com/CyKm2mxQir0J7KyCxyQ5M2';
      const supportPhone = supportContent?.phoneNumber || '+2340000000000';
      const playStoreLink = 'https://play.google.com/store/apps/details?id=com.ameedata.app';

      // Send Welcome Message
      const welcomeSubject = 'Welcome to AmeeData!';
      const welcomeHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
              <h2 style="color: #333; text-align: center;">Welcome to AmeeData, ${first_name}!</h2>
              <p style="color: #666; font-size: 16px;">We are thrilled to have you on board. Start enjoying seamless data, airtime, and utility payments today.</p>
              <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 24px 0;">
                  <p style="color: #333; font-weight: bold; margin-bottom: 10px;">Get Started with ease:</p>
                  <p style="margin: 8px 0; font-size: 15px;">📱 <strong>Download our Mobile App:</strong> <a href="${playStoreLink}" style="color: #6C2BD9; text-decoration: none;">Get it on Google Play</a></p>
                  <p style="margin: 8px 0; font-size: 15px;">💬 <strong>Join our WhatsApp Community:</strong> <a href="${whatsappGroupLink}" style="color: #6C2BD9; text-decoration: none;">Join here</a></p>
                  <p style="margin: 8px 0; font-size: 15px;">📞 <strong>Customer Support:</strong> ${supportPhone}</p>
              </div>
              <p style="color: #666; font-size: 14px; line-height: 1.5;">If you have any questions or need assistance, feel free to reach out to our support team.</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
              <p style="color: #999; font-size: 12px; text-align: center;">&copy; ${new Date().getFullYear()} AmeeData. All rights reserved.</p>
          </div>
      `;

      // Send asynchronously without awaiting to not block registration
      EmailService.sendEmail(email, welcomeSubject, welcomeHtml).catch(err => {
          console.error('Failed to send welcome email:', err);
      });

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

      // email could be an email or phone number
      const identifier = email?.trim().toLowerCase();
      const user = await User.findOne({
        $or: [
          { email: identifier },
          { phone_number: email?.trim() }
        ]
      });
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

      // Generate OTP and send via email
      await OTPService.createOTP(email, email, user._id.toString());

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