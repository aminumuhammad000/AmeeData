// controllers/notification.controller.ts
import { Response } from 'express';
import { Notification } from '../models/index.js';
import { NotificationService } from '../services/notification.service.js';
import { EmailService } from '../services/email.service.js';
import { AuthRequest } from '../types/index.js';
import { ApiResponse } from '../utils/response.js';

export class NotificationController {
  static async getNotifications(req: AuthRequest, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
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
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 500);
    }
  }

  static async markAsRead(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const success = await NotificationService.markAsRead(id as any);

      if (!success) {
        return ApiResponse.error(res, 'Notification not found', 404);
      }

      return ApiResponse.success(res, null, 'Notification marked as read');
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 500);
    }
  }

  static async markAllAsRead(req: AuthRequest, res: Response) {
    try {
      await Notification.updateMany(
        { user_id: req.user?.id, read_status: false },
        { read_status: true }
      );

      return ApiResponse.success(res, null, 'All notifications marked as read');
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 500);
    }
  }

  static async getNotificationById(req: AuthRequest, res: Response) {
    try {
      const notification = await Notification.findOne({
        _id: req.params.id,
        user_id: req.user?.id
      });

      if (!notification) {
        return ApiResponse.error(res, 'Notification not found', 404);
      }

      return ApiResponse.success(res, notification, 'Notification retrieved successfully');
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 500);
    }
  }

  static async deleteNotification(req: AuthRequest, res: Response) {
    try {
      const notification = await Notification.findOneAndDelete({
        _id: req.params.id,
        user_id: req.user?.id
      });

      if (!notification) {
        return ApiResponse.error(res, 'Notification not found', 404);
      }

      return ApiResponse.success(res, null, 'Notification deleted successfully');
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 500);
    }
  }

  static async deleteAllNotifications(req: AuthRequest, res: Response) {
    try {
      await Notification.deleteMany({ user_id: req.user?.id });
      return ApiResponse.success(res, null, 'All notifications deleted successfully');
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 500);
    }
  }

  static async sendBroadcastNotification(req: AuthRequest, res: Response) {
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
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 500);
    }
  }

  static async deleteBroadcast(req: AuthRequest, res: Response) {
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
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 500);
    }
  }

  static async getBroadcasts(req: AuthRequest, res: Response) {
    try {
      // Check if user is admin
      if (!req.user?.role) {
        return ApiResponse.error(res, 'Unauthorized', 403);
      }

      const broadcasts = await Notification.find({ type: 'broadcast' }).sort({ created_at: -1 });
      return ApiResponse.success(res, broadcasts, 'Broadcast notifications retrieved successfully');
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 500);
    }
  }

  static async updateBroadcast(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { title, message, type, action_link } = req.body;

      // Check if user is admin
      if (!req.user?.role) {
        return ApiResponse.error(res, 'Unauthorized', 403);
      }

      const notification = await Notification.findOneAndUpdate(
        { _id: id, type: 'broadcast' },
        { title, message, type, action_link, updated_at: new Date() },
        { new: true }
      );

      if (!notification) {
        return ApiResponse.error(res, 'Broadcast notification not found', 404);
      }

      return ApiResponse.success(res, notification, 'Broadcast notification updated successfully');
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 500);
    }
  }

  static async sendEmailNotification(req: AuthRequest, res: Response) {
    try {
      const { subject, message, recipients, target } = req.body;

      let targetEmails: string[] = [];

      if (target) {
          const query: any = {};
          if (target === 'active') query.status = 'active';
          if (target === 'inactive') query.status = 'inactive';
          
          const User = (await import('../models/index.js')).User;
          const users = await User.find(query).select('email').lean();
          targetEmails = users.map((u: any) => u.email).filter(Boolean) as string[];
      } else if (Array.isArray(recipients) && recipients.length > 0) {
          targetEmails = recipients;
      }

      if (!subject || !message || targetEmails.length === 0) {
        return ApiResponse.error(res, 'Subject, message, and at least one recipient are required', 400);
      }

      console.log(`[Email Service] Attempting to send email to ${targetEmails.length} recipients...`);
      
      // Basic HTML wrapper for the email
      const htmlMessage = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #6C2BD9; border-bottom: 2px solid #6C2BD9; padding-bottom: 10px;">${subject}</h2>
          <div style="margin-top: 20px;">
            ${message.replace(/\n/g, '<br>')}
          </div>
          <p style="margin-top: 30px; font-size: 12px; color: #777; border-top: 1px solid #eee; padding-top: 20px;">
            This is an automated notification from AmeeData. Please do not reply to this email.
          </p>
        </div>
      `;

      // We'll send them in parallel - for very large lists, a queue would be better
      // Using Settled to ensure we try all even if some fail
      const results = await Promise.allSettled(
        targetEmails.map((email: string) => EmailService.sendEmail(email, subject, htmlMessage))
      );

      const successful = results.filter(r => r.status === 'fulfilled' && (r as any).value?.success).length;
      const failed = targetEmails.length - successful;

      console.log(`[Email Service] Finished: ${successful} successful, ${failed} failed.`);

      if (successful === 0 && failed > 0) {
        return ApiResponse.error(res, 'Failed to send emails. Please check your SMTP configuration.', 500);
      }

      return ApiResponse.success(res, 
        { total: targetEmails.length, successful, failed }, 
        `Email process completed: ${successful} sent, ${failed} failed.`
      );
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 500);
    }
  }
}