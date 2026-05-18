import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICareRequest extends Document {
  requester_id: Types.ObjectId;
  provider_id: Types.ObjectId;
  amount: number;
  purpose: string;
  message?: string;
  status: 'pending' | 'accepted' | 'declined' | 'cancelled';
  created_at: Date;
  updated_at: Date;
}

const careRequestSchema = new Schema<ICareRequest>({
  requester_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  provider_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  purpose: { type: String, required: true },
  message: { type: String },
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'declined', 'cancelled'], 
    default: 'pending' 
  },
}, { 
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } 
});

careRequestSchema.index({ requester_id: 1, status: 1 });
careRequestSchema.index({ provider_id: 1, status: 1 });

export const CareRequest = mongoose.model<ICareRequest>('CareRequest', careRequestSchema);
