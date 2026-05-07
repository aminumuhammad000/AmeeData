// models/plan.model.ts
import mongoose, { Schema } from 'mongoose';
import { IPlan } from '../types.js';

const planSchema = new Schema<IPlan>({
  operator_id: { type: Schema.Types.ObjectId, ref: 'Operator', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  developer_price: { type: Number },
  validity: { type: String, required: true },
  data_amount: { type: String },
  type: { type: String, enum: ['data', 'airtime'], required: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

export const Plan = mongoose.model<IPlan>('Plan', planSchema);