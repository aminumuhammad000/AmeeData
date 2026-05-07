// services/otp.service.ts
import { config } from '../config/bootstrap.js';
import { OTP } from '../models/index.js';

export class OTPService {
  static async generateOTP(): Promise<string> {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  static async createOTP(phone_number: string, email?: string, user_id?: string): Promise<string> {
    const otp_code = await this.generateOTP();
    const expires_at = new Date(Date.now() + config.otpExpiry);

    await OTP.create({
      user_id,
      phone_number,
      email,
      otp_code,
      expires_at,
      is_used: false
    });

    // TODO: Send OTP via SMS/Email service
    return otp_code;
  }

  static async verifyOTP(phone_number: string, otp_code: string): Promise<boolean> {
    const otp = await OTP.findOne({
      phone_number,
      otp_code,
      is_used: false,
      expires_at: { $gt: new Date() }
    });

    if (!otp) {
      return false;
    }

    otp.is_used = true;
    await otp.save();
    return true;
  }
}