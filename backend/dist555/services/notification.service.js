// services/notification.service.ts
import { Notification } from '../models/index.js';
import { User } from '../models/index.js';
export class NotificationService {
    static async createNotification(data) {
        return await Notification.create(data);
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
        // Get all active users
        const users = await User.find({ status: 'active' });
        // Create notification for each user
        const notifications = users.map(user => ({
            user_id: user._id,
            type: data.type,
            title: data.title,
            message: data.message,
            action_link: data.action_link,
            read_status: false
        }));
        // Bulk insert notifications
        const result = await Notification.insertMany(notifications);
        return {
            success: true,
            count: result.length,
            message: `Notification sent to ${result.length} users`
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
