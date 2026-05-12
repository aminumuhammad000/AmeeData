import nodemailer from 'nodemailer';
import { SystemSetting } from '../models/system_setting.model.js';

export class EmailService {
    private static async getTransporter() {
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

    static async sendEmail(to: string, subject: string, html: string) {
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
        } catch (error: any) {
            console.error('Error sending email:', error);
            return { success: false, error: error.message };
        }
    }

    static async sendOtpEmail(to: string, otp: string) {
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
}
