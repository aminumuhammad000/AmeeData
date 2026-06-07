import nodemailer from 'nodemailer';
import { SystemSetting } from '../models/system_setting.model.js';
export class EmailService {
    static async getTransporter() {
        const settings = await SystemSetting.findOne({ type: 'global_config' });
        const config = settings?.config?.email_config;
        const host = config?.smtp_host || process.env.SMTP_HOST;
        const port = config?.smtp_port || process.env.SMTP_PORT;
        const secure = config?.smtp_secure !== undefined ? config?.smtp_secure : process.env.SMTP_SECURE === 'true';
        const user = config?.smtp_user || process.env.SMTP_USER;
        const pass = config?.smtp_pass || process.env.SMTP_PASS;
        if (!host || !user || !pass) {
            console.warn('Email configuration is missing or incomplete.');
            return null;
        }
        return nodemailer.createTransport({
            host,
            port: Number(port) || 465,
            secure, // true for 465, false for other ports
            auth: {
                user,
                pass,
            },
        });
    }
    static async sendEmail(to, subject, html) {
        try {
            const transporter = await this.getTransporter();
            if (!transporter) {
                throw new Error('Email service not configured');
            }
            const settings = await SystemSetting.findOne({ type: 'global_config' });
            const config = settings?.config?.email_config;
            const notificationEmail = settings?.config?.notification_email || process.env.SMTP_USER;
            const senderName = config?.sender_name || process.env.SMTP_FROM_NAME || 'AmeeData';
            const senderEmail = notificationEmail || config?.smtp_user || process.env.SMTP_USER;
            const info = await transporter.sendMail({
                from: `"${senderName}" <${senderEmail}>`,
                to,
                subject,
                html,
            });
            console.log('Message sent: %s', info.messageId);
            return { success: true, messageId: info.messageId };
        }
        catch (error) {
            console.error('Error sending email:', error);
            return { success: false, error: error.message };
        }
    }
    static async sendOtpEmail(to, otp) {
        const subject = 'Password Reset OTP';
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
                <p style="color: #666; font-size: 16px;">Hello,</p>
                <p style="color: #666; font-size: 16px;">You have requested to reset your password. Please use the following One-Time Password (OTP) to proceed:</p>
                <div style="background-color: #f5f5f5; padding: 15px; text-align: center; border-radius: 8px; margin: 24px 0;">
                    <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #6C2BD9;">${otp}</span>
                </div>
                <p style="color: #666; font-size: 14px; line-height: 1.5;">This OTP is valid for 10 minutes. If you did not request this, please ignore this email.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                <p style="color: #999; font-size: 12px; text-align: center;">&copy; ${new Date().getFullYear()} AmeeData. All rights reserved.</p>
            </div>
        `;
        return this.sendEmail(to, subject, html);
    }
    static async sendBroadcastCreditEmail(to, amount, firstName) {
        const subject = 'Congratulations! 🚀 Your Wallet has been Credited';
        const html = `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; background-color: #ffffff; border-radius: 16px; border: 1px solid #f0f0f0;">
                <div style="text-align: center; margin-bottom: 32px;">
                    <div style="background-color: #6C2BD9; width: 80px; height: 80px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin: 0 auto 16px; line-height: 80px;">
                         <span style="font-size: 40px;">💰</span>
                    </div>
                    <h1 style="color: #111827; font-size: 28px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">Wallet Credited!</h1>
                </div>
                
                <p style="color: #4B5563; font-size: 18px; line-height: 28px; margin-bottom: 24px;">
                    Hello <span style="color: #111827; font-weight: 600;">${firstName}</span>,
                </p>
                
                <p style="color: #4B5563; font-size: 17px; line-height: 26px; margin-bottom: 24px;">
                    We have some exciting news! Your wallet has been credited with <strong>₦${amount.toLocaleString()}</strong> as part of our special system-wide reward program.
                </p>
                
                <div style="background-color: #F9FAFB; border: 1px dashed #E5E7EB; border-radius: 16px; padding: 32px; margin-bottom: 32px; text-align: center;">
                    <span style="color: #6B7280; font-size: 14px; text-transform: uppercase; letter-spacing: 1.5px; display: block; margin-bottom: 12px; font-weight: 600;">Amount Credited</span>
                    <span style="color: #6C2BD9; font-size: 42px; font-weight: 900;">₦${amount.toLocaleString()}</span>
                </div>
                
                <p style="color: #4B5563; font-size: 17px; line-height: 26px; margin-bottom: 32px; text-align: center;">
                    Congratulations! Feel free to use this balance for any of our services including data purchase, airtime top-up, and bill payments.
                </p>
                
                <div style="text-align: center;">
                    <a href="https://ameedata.com/dashboard" style="background-color: #6C2BD9; color: #ffffff; padding: 16px 40px; border-radius: 12px; text-decoration: none; font-weight: 700; display: inline-block; font-size: 16px; box-shadow: 0 4px 12px rgba(108, 43, 217, 0.2);">Explore Dashboard</a>
                </div>
                
                <hr style="border: none; border-top: 1px solid #F3F4F6; margin: 40px 0;" />
                
                <div style="text-align: center;">
                    <p style="color: #9CA3AF; font-size: 13px; margin: 0 0 8px 0;">
                        Need help? Contact our support team.
                    </p>
                    <p style="color: #6C2BD9; font-size: 14px; font-weight: 600; margin: 0;">
                        &copy; ${new Date().getFullYear()} AmeeData Platform
                    </p>
                </div>
            </div>
        `;
        return this.sendEmail(to, subject, html);
    }
}
