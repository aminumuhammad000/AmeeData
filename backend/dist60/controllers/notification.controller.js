import { Notification } from '../models/index.js';
import { NotificationService } from '../services/notification.service.js';
import { ApiResponse } from '../utils/response.js';
export class NotificationController {
    static async getNotifications(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;
            const notifications = await Notification.find({ user_id: req.user?.id })
                .skip(skip)
                .limit(limit)
                .sort({ created_at: -1 });
            const total = await Notification.countDocuments({ user_id: req.user?.id });
            const unread = await Notification.countDocuments({ user_id: req.user?.id, read_status: false });
            return ApiResponse.paginated(res, notifications, {
                page,
                limit,
                total,
                unread,
                pages: Math.ceil(total / limit)
            }, 'Notifications retrieved successfully');
        }
        catch (error) {
            return ApiResponse.error(res, error.message, 500);
        }
    }
    static async markAsRead(req, res) {
        try {
            const { id } = req.params;
            const success = await NotificationService.markAsRead(id);
            if (!success) {
                return ApiResponse.error(res, 'Notification not found', 404);
            }
            return ApiResponse.success(res, null, 'Notification marked as read');
        }
        catch (error) {
            return ApiResponse.error(res, error.message, 500);
        }
    }
    static async markAllAsRead(req, res) {
        try {
            await Notification.updateMany({ user_id: req.user?.id, read_status: false }, { read_status: true });
            return ApiResponse.success(res, null, 'All notifications marked as read');
        }
        catch (error) {
            return ApiResponse.error(res, error.message, 500);
        }
    }
    static async getNotificationById(req, res) {
        try {
            const notification = await Notification.findOne({
                _id: req.params.id,
                user_id: req.user?.id
            });
            if (!notification) {
                return ApiResponse.error(res, 'Notification not found', 404);
            }
            return ApiResponse.success(res, notification, 'Notification retrieved successfully');
        }
        catch (error) {
            return ApiResponse.error(res, error.message, 500);
        }
    }
    static async deleteNotification(req, res) {
        try {
            const notification = await Notification.findOneAndDelete({
                _id: req.params.id,
                user_id: req.user?.id
            });
            if (!notification) {
                return ApiResponse.error(res, 'Notification not found', 404);
            }
            return ApiResponse.success(res, null, 'Notification deleted successfully');
        }
        catch (error) {
            return ApiResponse.error(res, error.message, 500);
        }
    }
    static async deleteAllNotifications(req, res) {
        try {
            await Notification.deleteMany({ user_id: req.user?.id });
            return ApiResponse.success(res, null, 'All notifications deleted successfully');
        }
        catch (error) {
            return ApiResponse.error(res, error.message, 500);
        }
    }
    static async sendBroadcastNotification(req, res) {
        try {
            const { title, message, type, action_link } = req.body;
            if (!title || !message || !type) {
                return ApiResponse.error(res, 'Title, message, and type are required', 400);
            }
            const result = await NotificationService.sendBroadcastNotification({
                title,
                message,
                type,
                action_link
            });
            return ApiResponse.success(res, result, result.message);
        }
        catch (error) {
            return ApiResponse.error(res, error.message, 500);
        }
    }
    static async deleteBroadcast(req, res) {
        try {
            const { id } = req.params;
            // Check if user is admin
            if (!req.user?.role) {
                return ApiResponse.error(res, 'Unauthorized', 403);
            }
            const notification = await Notification.findOneAndDelete({
                _id: id,
                type: 'broadcast'
            });
            if (!notification) {
                return ApiResponse.error(res, 'Broadcast notification not found', 404);
            }
            return ApiResponse.success(res, null, 'Broadcast notification deleted successfully');
        }
        catch (error) {
            return ApiResponse.error(res, error.message, 500);
        }
    }
    static async getBroadcasts(req, res) {
        try {
            // Check if user is admin
            if (!req.user?.role) {
                return ApiResponse.error(res, 'Unauthorized', 403);
            }
            const broadcasts = await Notification.find({ type: 'broadcast' }).sort({ created_at: -1 });
            return ApiResponse.success(res, broadcasts, 'Broadcast notifications retrieved successfully');
        }
        catch (error) {
            return ApiResponse.error(res, error.message, 500);
        }
    }
    static async updateBroadcast(req, res) {
        try {
            const { id } = req.params;
            const { title, message, type, action_link } = req.body;
            // Check if user is admin
            if (!req.user?.role) {
                return ApiResponse.error(res, 'Unauthorized', 403);
            }
            const notification = await Notification.findOneAndUpdate({ _id: id, type: 'broadcast' }, { title, message, type, action_link, updated_at: new Date() }, { new: true });
            if (!notification) {
                return ApiResponse.error(res, 'Broadcast notification not found', 404);
            }
            return ApiResponse.success(res, notification, 'Broadcast notification updated successfully');
        }
        catch (error) {
            return ApiResponse.error(res, error.message, 500);
        }
    }
    static async sendEmailNotification(req, res) {
        try {
            const { subject, message, recipients } = req.body;
            if (!subject || !message || !recipients || recipients.length === 0) {
                return ApiResponse.error(res, 'Subject, message, and recipients are required', 400);
            }
            // TODO: Integrate actual email service (e.g., Nodemailer, SendGrid, etc.)
            console.log(`[Email Service] Sending email to ${recipients.length} recipients...`);
            console.log(`[Email Service] Subject: ${subject}`);
            // Simulate some processing time
            await new Promise(resolve => setTimeout(resolve, 500));
            return ApiResponse.success(res, { count: recipients.length }, `Email queued for ${recipients.length} recipients`);
        }
        catch (error) {
            return ApiResponse.error(res, error.message, 500);
        }
    }
}
