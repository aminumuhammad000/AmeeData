import cron from 'node-cron';
import { User } from '../models/user.model.js';
import { EmailService } from './email.service.js';
export class CronService {
    static init() {
        console.log('📅 Initializing Cron Service...');
        // Friday Prayer and Reminder at 8:00 AM every Friday
        // 0 8 * * 5
        cron.schedule('0 8 * * 5', async () => {
            console.log('🕌 Running Friday Prayer and Reminder task...');
            await this.sendFridayEmail();
        });
        // Sunday Blessing and Reminder at 8:00 AM every Sunday
        // 0 8 * * 0
        cron.schedule('0 8 * * 0', async () => {
            console.log('⛪ Running Sunday Blessing and Reminder task...');
            await this.sendSundayEmail();
        });
        console.log('✅ Cron Service tasks scheduled');
    }
    static async sendFridayEmail() {
        try {
            const users = await User.find({ status: 'active' });
            console.log(`Sending Friday emails to ${users.length} users...`);
            const subject = 'Jumu\'ah Mubarak! 🌙 Your Friday Reminder from AmeeData';
            for (const user of users) {
                const html = `
                    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; background-color: #ffffff; border-radius: 16px; border: 1px solid #f0f0f0;">
                        <div style="text-align: center; margin-bottom: 32px;">
                            <div style="background-color: #6C2BD9; width: 80px; height: 80px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin: 0 auto 16px; line-height: 80px;">
                                 <span style="font-size: 40px;">🌙</span>
                            </div>
                            <h1 style="color: #111827; font-size: 28px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">Jumu'ah Mubarak!</h1>
                        </div>
                        
                        <p style="color: #4B5563; font-size: 18px; line-height: 28px; margin-bottom: 24px;">
                            Hello <span style="color: #111827; font-weight: 600;">${user.first_name}</span>,
                        </p>
                        
                        <p style="color: #4B5563; font-size: 17px; line-height: 26px; margin-bottom: 24px;">
                            As we witness another blessed Friday, we pray that your day is filled with peace, blessings, and answered prayers. May this day bring light and joy to your heart and home.
                        </p>

                        <div style="background-color: #F3F4F6; border-left: 4px solid #6C2BD9; padding: 20px; margin-bottom: 24px; border-radius: 0 12px 12px 0;">
                            <p style="color: #1F2937; font-size: 16px; font-style: italic; margin: 0;">
                                "The best day on which the sun has risen is Friday; on it Adam was created. on it he was made to enter Paradise, on it he was expelled from it. And the last hour will take place on no day other than Friday."
                            </p>
                        </div>
                        
                        <p style="color: #4B5563; font-size: 17px; line-height: 26px; margin-bottom: 32px;">
                            <strong>Quick Reminder:</strong> Don't forget to top up your data and airtime for the weekend. Keep your loved ones connected!
                        </p>
                        
                        <div style="text-align: center;">
                            <a href="https://ameedata.com/dashboard" style="background-color: #6C2BD9; color: #ffffff; padding: 16px 40px; border-radius: 12px; text-decoration: none; font-weight: 700; display: inline-block; font-size: 16px;">Top Up Now</a>
                        </div>
                        
                        <hr style="border: none; border-top: 1px solid #F3F4F6; margin: 40px 0;" />
                        
                        <div style="text-align: center;">
                            <p style="color: #9CA3AF; font-size: 13px; margin: 0 0 8px 0;">
                                Spread the love. Share AmeeData with friends.
                            </p>
                            <p style="color: #6C2BD9; font-size: 14px; font-weight: 600; margin: 0;">
                                &copy; ${new Date().getFullYear()} AmeeData Platform
                            </p>
                        </div>
                    </div>
                `;
                await EmailService.sendEmail(user.email, subject, html);
                // Pause slightly to avoid rate limits
                await new Promise(resolve => setTimeout(resolve, 500));
            }
            console.log('✅ Friday emails sent successfully');
        }
        catch (error) {
            console.error('❌ Error sending Friday emails:', error);
        }
    }
    static async sendSundayEmail() {
        try {
            const users = await User.find({ status: 'active' });
            console.log(`Sending Sunday emails to ${users.length} users...`);
            const subject = 'Happy Sunday! ✨ Your Weekend Blessing from AmeeData';
            for (const user of users) {
                const html = `
                    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; background-color: #ffffff; border-radius: 16px; border: 1px solid #f0f0f0;">
                        <div style="text-align: center; margin-bottom: 32px;">
                            <div style="background-color: #6C2BD9; width: 80px; height: 80px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin: 0 auto 16px; line-height: 80px;">
                                 <span style="font-size: 40px;">✨</span>
                            </div>
                            <h1 style="color: #111827; font-size: 28px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">Happy Sunday!</h1>
                        </div>
                        
                        <p style="color: #4B5563; font-size: 18px; line-height: 28px; margin-bottom: 24px;">
                            Hello <span style="color: #111827; font-weight: 600;">${user.first_name}</span>,
                        </p>
                        
                        <p style="color: #4B5563; font-size: 17px; line-height: 26px; margin-bottom: 24px;">
                            We wish you a magnificent Sunday filled with rest, reflection, and rejuvenation. May your week ahead be productive and full of success.
                        </p>

                        <div style="background-color: #F9FAFB; border-radius: 16px; padding: 24px; margin-bottom: 24px; text-align: center;">
                            <p style="color: #374151; font-size: 17px; font-weight: 600; margin: 0;">
                                "Sunday is the perfect day to refuel your soul and be grateful for each and every one of your blessings."
                            </p>
                        </div>
                        
                        <p style="color: #4B5563; font-size: 17px; line-height: 26px; margin-bottom: 32px;">
                            As the new week approaches, ensure your bills are settled and your data balance is ready for the tasks ahead. We've got you covered!
                        </p>
                        
                        <div style="text-align: center;">
                            <a href="https://ameedata.com/dashboard" style="background-color: #6C2BD9; color: #ffffff; padding: 16px 40px; border-radius: 12px; text-decoration: none; font-weight: 700; display: inline-block; font-size: 16px;">Visit Dashboard</a>
                        </div>
                        
                        <hr style="border: none; border-top: 1px solid #F3F4F6; margin: 40px 0;" />
                        
                        <div style="text-align: center;">
                            <p style="color: #9CA3AF; font-size: 13px; margin: 0 0 8px 0;">
                                Ready for the week? Let AmeeData power your connections.
                            </p>
                            <p style="color: #6C2BD9; font-size: 14px; font-weight: 600; margin: 0;">
                                &copy; ${new Date().getFullYear()} AmeeData Platform
                            </p>
                        </div>
                    </div>
                `;
                await EmailService.sendEmail(user.email, subject, html);
                // Pause slightly to avoid rate limits
                await new Promise(resolve => setTimeout(resolve, 500));
            }
            console.log('✅ Sunday emails sent successfully');
        }
        catch (error) {
            console.error('❌ Error sending Sunday emails:', error);
        }
    }
}
