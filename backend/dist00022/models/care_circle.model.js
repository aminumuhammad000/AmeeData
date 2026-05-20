import mongoose, { Schema } from 'mongoose';
const careCircleMemberSchema = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    member_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    nickname: { type: String },
    relationship_label: { type: String },
    quick_amounts: { type: [Number], default: [200, 500, 1000] },
    is_pinned: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    tags: [{ type: String }],
    notes: { type: String },
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});
careCircleMemberSchema.index({ user_id: 1, member_id: 1 }, { unique: true });
export const CareCircleMember = mongoose.model('CareCircleMember', careCircleMemberSchema);
