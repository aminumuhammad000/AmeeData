import nodemailer from 'nodemailer';
import { SystemSetting } from '../models/system_setting.model.js';
export class EmailService {
    static async getTransporter() {
        // Fetch settings from DB
        const settings = await SystemSetting.findOne({ type: 'global_config' });
        const config = settings?.config?.email_config;
        if (!config || !config.smtp_host) {
            console.warn('Email configuration is missing or incomplete.');
            return null;
        }
        return nodemailer.createTransport({
            host: config.smtp_host,
            port: config.smtp_port,
            secure: config.smtp_secure, // true for 465, false for other ports
            auth: {
                user: config.smtp_user,
                pass: config.smtp_pass,
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
            const senderName = settings?.config?.email_config?.sender_name || 'VTU App';
            const senderEmail = settings?.config?.notification_email || settings?.config?.email_config?.smtp_user;
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
                <div style="background-color: #f5f5f5; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
                    <span style="font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #007bff;">${otp}</span>
                </div>
                <p style="color: #666; font-size: 14px;">This OTP is valid for 10 minutes. If you did not request this, please ignore this email.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                <p style="color: #999; font-size: 12px; text-align: center;">&copy; ${new Date().getFullYear()} VTU App. All rights reserved.</p>
            </div>
        `;
        return this.sendEmail(to, subject, html);
    }
}
