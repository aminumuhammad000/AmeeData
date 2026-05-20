import { SupportTicket } from '../models/index.js';
import { ApiResponse } from '../utils/response.js';
export class SupportController {
    static async createTicket(req, res) {
        try {
            const { subject, description, priority } = req.body;
            const ticket = await SupportTicket.create({
                user_id: req.user?.id,
                subject,
                description,
                priority: priority || 'medium',
                status: 'new'
            });
            return ApiResponse.success(res, ticket, 'Support ticket created successfully', 201);
        }
        catch (error) {
            return ApiResponse.error(res, error.message, 500);
        }
    }
    static async getTickets(req, res) {
        try {
            const tickets = await SupportTicket.find({ user_id: req.user?.id })
                .sort({ created_at: -1 });
            return ApiResponse.success(res, tickets, 'Tickets retrieved successfully');
        }
        catch (error) {
            return ApiResponse.error(res, error.message, 500);
        }
    }
    static async getAllTickets(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;
            const filter = {};
            if (req.query.status)
                filter.status = req.query.status;
            if (req.query.priority)
                filter.priority = req.query.priority;
            const tickets = await SupportTicket.find(filter)
                .populate('user_id', 'first_name last_name email')
                .populate('admin_id', 'first_name last_name')
                .skip(skip)
                .limit(limit)
                .sort({ created_at: -1 });
            const total = await SupportTicket.countDocuments(filter);
            return ApiResponse.paginated(res, tickets, {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }, 'Tickets retrieved successfully');
        }
        catch (error) {
            return ApiResponse.error(res, error.message, 500);
        }
    }
    static async updateTicketStatus(req, res) {
        try {
            const { status, admin_id } = req.body;
            const ticket = await SupportTicket.findByIdAndUpdate(req.params.id, { status, admin_id, updated_at: new Date() }, { new: true });
            if (!ticket) {
                return ApiResponse.error(res, 'Ticket not found', 404);
            }
            return ApiResponse.success(res, ticket, 'Ticket updated successfully');
        }
        catch (error) {
            return ApiResponse.error(res, error.message, 500);
        }
    }
    static async getTicketById(req, res) {
        try {
            const ticket = await SupportTicket.findOne({
                _id: req.params.id,
                user_id: req.user?.id
            });
            if (!ticket) {
                return ApiResponse.error(res, 'Ticket not found', 404);
            }
            return ApiResponse.success(res, ticket, 'Ticket retrieved successfully');
        }
        catch (error) {
            return ApiResponse.error(res, error.message, 500);
        }
    }
    static async updateTicket(req, res) {
        try {
            const { subject, description, priority } = req.body;
            const updates = {};
            if (subject)
                updates.subject = subject;
            if (description)
                updates.description = description;
            if (priority)
                updates.priority = priority;
            updates.updated_at = new Date();
            const ticket = await SupportTicket.findOneAndUpdate({ _id: req.params.id, user_id: req.user?.id }, updates, { new: true });
            if (!ticket) {
                return ApiResponse.error(res, 'Ticket not found', 404);
            }
            return ApiResponse.success(res, ticket, 'Ticket updated successfully');
        }
        catch (error) {
            return ApiResponse.error(res, error.message, 500);
        }
    }
    static async deleteTicket(req, res) {
        try {
            const ticket = await SupportTicket.findOneAndDelete({
                _id: req.params.id,
                user_id: req.user?.id
            });
            if (!ticket) {
                return ApiResponse.error(res, 'Ticket not found', 404);
            }
            return ApiResponse.success(res, null, 'Ticket deleted successfully');
        }
        catch (error) {
            return ApiResponse.error(res, error.message, 500);
        }
    }
}
