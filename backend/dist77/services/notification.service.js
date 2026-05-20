// services/notification.service.ts
import { Notification, User } from '../models/index.js';
import { Expo } from 'expo-server-sdk';
const expo = new Expo();
export class NotificationService {
    static async createNotification(data) {
        return await Notification.create(data);
    }
    static async sendDirectNotification(user_id, data) {
        // 1. Create In-App Notification
        await this.createNotification({
            user_id,
            type: data.type,
            title: data.title,
            message: data.message,
            action_link: data.action_link
        });
        // 2. Send Push Notification
        const user = await User.findById(user_id);
        if (user && user.push_token && Expo.isExpoPushToken(user.push_token)) {
            const messages = [{
                    to: user.push_token,
                    sound: 'default',
                    title: data.title,
                    body: data.message,
                    data: { action_link: data.action_link, type: data.type }
                }];
            const chunks = expo.chunkPushNotifications(messages);
            for (const chunk of chunks) {
                try {
                    await expo.sendPushNotificationsAsync(chunk);
                }
                catch (error) {
                    console.error('Error sending single push notification:', error);
                }
            }
        }
    }
    static async sendTransactionNotification(user_id, transaction) {
        await this.createNotification({
            user_id,
            type: 'transaction_alert',
            title: 'Transaction Alert',
            message: `Your ${transaction.type} transaction of ₦${transaction.amount} was ${transaction.status}`,
            action_link: `/transactions/${transaction._id}`
        });
    }
    static async sendBroadcastNotification(data) {
        // 1. Create a master broadcast record for Admin Dashboard management
        await Notification.create({
            type: 'broadcast',
            title: data.title,
            message: data.message,
            action_link: data.action_link
        });
        // 2. Get all active users
        const users = await User.find({ status: 'active' });
        // 3. Create notification for each user
        const notifications = users.map(user => ({
            user_id: user._id,
            type: data.type || 'system',
            title: data.title,
            message: data.message,
            action_link: data.action_link,
            read_status: false
        }));
        // 4. Bulk insert notifications
        if (notifications.length > 0) {
            await Notification.insertMany(notifications);
        }
        // 5. Send push notifications
        const messages = [];
        for (const user of users) {
            if (user.push_token && Expo.isExpoPushToken(user.push_token)) {
                messages.push({
                    to: user.push_token,
                    sound: 'default',
                    title: data.title,
                    body: data.message,
                    data: { action_link: data.action_link, type: data.type }
                });
            }
        }
        if (messages.length > 0) {
            const chunks = expo.chunkPushNotifications(messages);
            for (const chunk of chunks) {
                try {
                    await expo.sendPushNotificationsAsync(chunk);
                }
                catch (error) {
                    console.error('Error sending push notifications chunk:', error);
                }
            }
        }
        return {
            success: true,
            count: users.length,
            pushCount: messages.length,
            message: `Notification sent to ${users.length} users (${messages.length} push notifications)`
        };
    }
    static async markAsRead(notification_id) {
        const notification = await Notification.findById(notification_id);
        if (!notification)
            return false;
        notification.read_status = true;
        await notification.save();
        return true;
    }
}
