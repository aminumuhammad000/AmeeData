import { CareCircleMember, User, Transaction, Wallet } from '../models/index.js';
import { CareRequest } from '../models/care_request.model.js';
import { ApiResponse } from '../utils/response.js';
import { NotificationService } from '../services/notification.service.js';
import { EmailService } from '../services/email.service.js';
export class CareController {
    /**
     * Get all members in user's Care Circle
     */
    static async getCircle(req, res) {
        try {
            const members = await CareCircleMember.find({ user_id: req.user?.id })
                .populate('member_id', 'first_name last_name phone_number profile_picture email')
                .sort({ is_pinned: -1, order: 1, created_at: -1 });
            return ApiResponse.success(res, members, 'Care Circle retrieved successfully');
        }
        catch (error) {
            return ApiResponse.error(res, error.message, 500);
        }
    }
    /**
     * Add a member to Care Circle
     */
    static async addMember(req, res) {
        try {
            const { phone_number, member_id, nickname, relationship_label } = req.body;
            let targetId = member_id;
            // If phone provided, find user
            if (phone_number && !targetId) {
                const cleanPhone = phone_number.replace(/\D/g, '');
                const user = await User.findOne({
                    $or: [
                        { phone_number: phone_number },
                        { phone_number: cleanPhone },
                        { phone_number: { $regex: cleanPhone + '$' } }
                    ]
                });
                if (!user)
                    return ApiResponse.error(res, 'User not found in AmeeData community', 404);
                targetId = user._id;
            }
            if (!targetId)
                return ApiResponse.error(res, 'Member ID or Phone is required', 400);
            if (targetId.toString() === req.user?.id)
                return ApiResponse.error(res, 'Cannot add yourself to your circle', 400);
            const existing = await CareCircleMember.findOne({ user_id: req.user?.id, member_id: targetId });
            if (existing)
                return ApiResponse.error(res, 'This person is already in your Care Circle', 400);
            const member = await CareCircleMember.create({
                user_id: req.user?.id,
                member_id: targetId,
                nickname,
                relationship_label
            });
            return ApiResponse.success(res, member, 'Member added to Care Circle');
        }
        catch (error) {
            return ApiResponse.error(res, error.message, 500);
        }
    }
    /**
     * Update member details
     */
    static async updateMember(req, res) {
        try {
            const { id } = req.params;
            const updates = req.body;
            const member = await CareCircleMember.findOneAndUpdate({ _id: id, user_id: req.user?.id }, { $set: updates }, { new: true });
            if (!member)
                return ApiResponse.error(res, 'Member not found', 404);
            return ApiResponse.success(res, member, 'Member updated successfully');
        }
        catch (error) {
            return ApiResponse.error(res, error.message, 500);
        }
    }
    /**
     * Remove member
     */
    static async removeMember(req, res) {
        try {
            const { id } = req.params;
            const result = await CareCircleMember.findOneAndDelete({ _id: id, user_id: req.user?.id });
            if (!result)
                return ApiResponse.error(res, 'Member not found', 404);
            return ApiResponse.success(res, null, 'Member removed from Care Circle');
        }
        catch (error) {
            return ApiResponse.error(res, error.message, 500);
        }
    }
    /**
     * Get relationship stats for a member
     */
    static async getStats(req, res) {
        try {
            const { member_id } = req.params;
            const transactions = await Transaction.find({
                user_id: req.user?.id,
                type: 'transfer',
                description: { $regex: member_id, $options: 'i' } // This is weak, but let's try
            });
            // Better: find by recipient phone if we have it
            const memberRecord = await CareCircleMember.findOne({ user_id: req.user?.id, member_id })
                .populate('member_id', 'phone_number');
            let count = 0;
            let total = 0;
            let lastSent = null;
            if (memberRecord && memberRecord.member_id.phone_number) {
                const phone = memberRecord.member_id.phone_number;
                const txs = await Transaction.find({
                    user_id: req.user?.id,
                    type: 'transfer',
                    $or: [
                        { description: { $regex: phone, $options: 'i' } },
                        { reference_number: { $regex: `CARE-`, $options: 'i' } }
                    ]
                }).sort({ created_at: -1 });
                // We'd need more precise tracking in Transaction model (recipient_id) for accurate stats
                // For now, let's just return what we can find
                count = txs.length;
                total = txs.reduce((sum, tx) => sum + tx.amount, 0);
                lastSent = txs[0]?.created_at || null;
            }
            return ApiResponse.success(res, {
                total_care_count: count,
                total_amount_sent: total,
                last_sent_date: lastSent
            }, 'Stats retrieved');
        }
        catch (error) {
            return ApiResponse.error(res, error.message, 500);
        }
    }
    /**
     * Request care from a circle member
     */
    static async requestCare(req, res) {
        try {
            const { provider_id, amount, purpose, message } = req.body;
            console.log('📥 Incoming Care Request:', req.body);
            if (!provider_id || !amount || !purpose) {
                return ApiResponse.error(res, 'Provider, amount and purpose are required', 400);
            }
            if (amount < 5) {
                return ApiResponse.error(res, 'Minimum care request is ₦5', 400);
            }
            if (provider_id.toString() === req.user?.id) {
                return ApiResponse.error(res, 'Cannot request care from yourself', 400);
            }
            const provider = await User.findById(provider_id);
            if (!provider)
                return ApiResponse.error(res, 'Target member not found', 404);
            if (provider.allow_care_requests === false) {
                return ApiResponse.error(res, 'This member is currently not accepting care requests', 400);
            }
            const request = await CareRequest.create({
                requester_id: req.user?.id,
                provider_id,
                amount,
                purpose,
                message,
                status: 'pending'
            });
            // Send notifications to the provider
            const requester = await User.findById(req.user?.id);
            const requesterName = requester ? `${requester.first_name} ${requester.last_name}` : 'A member';
            const notificationTitle = 'New Care Request ❤️';
            const notificationMessage = `${requesterName} has requested ₦${amount} for "${purpose}".`;
            // 1. In-App and Push Notification
            NotificationService.sendDirectNotification(provider._id, {
                type: 'care_request',
                title: notificationTitle,
                message: notificationMessage,
                action_link: '/care/requests'
            }).catch(err => console.error('Error sending care request push notification:', err));
            // 2. Email Notification
            if (provider.email) {
                const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <h2 style="color: #6C2BD9; text-align: center;">New Care Request received</h2>
            <p style="color: #333; font-size: 16px;">Hello <b>${provider.first_name}</b>,</p>
            <p style="color: #666; font-size: 16px;">You have received a new Care Request from <b>${requesterName}</b>.</p>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 24px 0;">
              <p style="margin: 8px 0; color: #333;"><b>Amount:</b> ₦${amount}</p>
              <p style="margin: 8px 0; color: #333;"><b>Purpose:</b> ${purpose}</p>
              ${message ? `<p style="margin: 8px 0; color: #333;"><b>Message:</b> ${message}</p>` : ''}
            </div>
            <p style="color: #666; font-size: 14px;">Open the AmeeData app to accept or decline this request.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="color: #999; font-size: 12px; text-align: center;">&copy; ${new Date().getFullYear()} AmeeData. All rights reserved.</p>
          </div>
        `;
                EmailService.sendEmail(provider.email, notificationTitle, emailHtml).catch(err => console.error('Error sending care request email:', err));
            }
            return ApiResponse.success(res, request, 'Care request sent successfully');
        }
        catch (error) {
            return ApiResponse.error(res, error.message, 500);
        }
    }
    /**
     * Get care requests (both sent and received)
     */
    /**
     * Respond to a care request (Accept or Decline)
     */
    static async respondToRequest(req, res) {
        try {
            const { request_id, status } = req.body; // 'accepted' or 'declined'
            const provider_id = req.user?.id;
            if (!['accepted', 'declined'].includes(status)) {
                return ApiResponse.error(res, 'Invalid status', 400);
            }
            const request = await CareRequest.findById(request_id);
            if (!request)
                return ApiResponse.error(res, 'Request not found', 404);
            if (request.provider_id.toString() !== provider_id) {
                return ApiResponse.error(res, 'Unauthorized to respond to this request', 403);
            }
            if (request.status !== 'pending') {
                return ApiResponse.error(res, `Request is already ${request.status}`, 400);
            }
            if (status === 'declined') {
                request.status = 'declined';
                await request.save();
                return ApiResponse.success(res, request, 'Care request declined');
            }
            // If accepted, we process the transfer atomistically
            const senderWallet = await Wallet.findOne({ user_id: provider_id });
            if (!senderWallet)
                return ApiResponse.error(res, 'Your wallet was not found', 404);
            if (senderWallet.balance < request.amount) {
                return ApiResponse.error(res, 'Insufficient main balance to fulfill this request', 400);
            }
            const requesterId = request.requester_id;
            const amount = request.amount;
            let session;
            try {
                const mongoose = (await import('mongoose')).default;
                session = await mongoose.startSession();
                session.startTransaction();
            }
            catch (e) {
                session = null;
            }
            try {
                const { WalletService } = await import('../services/wallet.service.js');
                // 1. Debit Provider (Sender)
                await WalletService.debitWallet(provider_id, amount, session);
                // 2. Credit Requester (Recipient)
                await WalletService.creditWallet(requesterId, amount, false, session);
                // 3. Update Request Status
                request.status = 'accepted';
                await request.save({ session });
                // 4. Create Transactions
                const reference = `CARE-Q-${Date.now()}`;
                // Provider Transaction
                await Transaction.create([{
                        user_id: provider_id,
                        wallet_id: senderWallet._id,
                        type: 'transfer',
                        amount,
                        fee: 0,
                        total_charged: amount,
                        status: 'successful',
                        reference_number: reference,
                        description: `Care fulfilled for ${request.purpose}`,
                        payment_method: 'wallet'
                    }], { session });
                // Requester Transaction
                const recipientWallet = await Wallet.findOne({ user_id: requesterId }).session(session);
                if (recipientWallet) {
                    const provider = await User.findById(provider_id).session(session);
                    await Transaction.create([{
                            user_id: requesterId,
                            wallet_id: recipientWallet._id,
                            type: 'transfer_received',
                            amount,
                            fee: 0,
                            total_charged: amount,
                            status: 'successful',
                            reference_number: reference,
                            description: `Care received from ${provider?.first_name} for ${request.purpose}`,
                            payment_method: 'wallet'
                        }], { session });
                }
                if (session) {
                    await session.commitTransaction();
                    session.endSession();
                }
                // Send Notification to requester
                NotificationService.sendDirectNotification(requesterId, {
                    type: 'care_fulfilled',
                    title: 'Care Request Accepted ❤️',
                    message: `Your care request for ₦${amount} has been accepted!`,
                    action_link: '/transactions'
                }).catch(err => console.error('Error sending fulfillment notification:', err));
                return ApiResponse.success(res, request, 'Care request fulfilled successfully');
            }
            catch (error) {
                if (session) {
                    await session.abortTransaction();
                    session.endSession();
                }
                return ApiResponse.error(res, error.message || 'Fulfillment failed', 500);
            }
        }
        catch (error) {
            return ApiResponse.error(res, error.message, 500);
        }
    }
    static async getRequests(req, res) {
        try {
            const { type } = req.query; // 'sent' or 'received'
            let query = {};
            if (type === 'sent') {
                query.requester_id = req.user?.id;
            }
            else if (type === 'received') {
                query.provider_id = req.user?.id;
            }
            else {
                query = {
                    $or: [
                        { requester_id: req.user?.id },
                        { provider_id: req.user?.id }
                    ]
                };
            }
            const requests = await CareRequest.find(query)
                .populate('requester_id', 'first_name last_name phone_number profile_picture')
                .populate('provider_id', 'first_name last_name phone_number profile_picture')
                .sort({ created_at: -1 });
            return ApiResponse.success(res, requests, 'Care requests retrieved');
        }
        catch (error) {
            return ApiResponse.error(res, error.message, 500);
        }
    }
    /**
     * Get list of active care purposes
     */
    static async getPurposes(req, res) {
        try {
            const { CarePurpose } = await import('../models/index.js');
            const purposes = await CarePurpose.find({ is_active: true }).sort({ label: 1 });
            return ApiResponse.success(res, purposes, 'Purposes retrieved');
        }
        catch (error) {
            return ApiResponse.error(res, error.message, 500);
        }
    }
}
