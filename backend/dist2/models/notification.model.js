// models/notification.model.ts
import mongoose, { Schema } from 'mongoose';
const notificationSchema = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'User' },
    type: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    read_status: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now },
    action_link: { type: String }
});
export const Notification = mongoose.model('Notification', notificationSchema);
