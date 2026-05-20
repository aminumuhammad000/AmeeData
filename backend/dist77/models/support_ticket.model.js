// modelssupport_ticket.model.ts
import mongoose, { Schema } from 'mongoose';
const supportTicketSchema = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'User' },
    admin_id: { type: Schema.Types.ObjectId, ref: 'AdminUser' },
    subject: { type: String, required: true },
    description: { type: String, required: true },
    status: {
        type: String,
        enum: ['new', 'open', 'pending_user', 'resolved', 'closed'],
        default: 'new'
    },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});
export const SupportTicket = mongoose.model('SupportTicket', supportTicketSchema);
