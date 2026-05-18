import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICareCircleMember extends Document {
  user_id: Types.ObjectId;
  member_id: Types.ObjectId;
  nickname?: string;
  relationship_label?: string;
  quick_amounts?: number[];
  is_pinned: boolean;
  order: number;
  tags?: string[];
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

const careCircleMemberSchema = new Schema<ICareCircleMember>({
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

export const CareCircleMember = mongoose.model<ICareCircleMember>('CareCircleMember', careCircleMemberSchema);
