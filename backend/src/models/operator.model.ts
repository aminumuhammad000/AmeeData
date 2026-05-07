// models/operator.model.ts
import mongoose, { Schema } from 'mongoose';
import { IOperator } from '../types.js';

const operatorSchema = new Schema<IOperator>({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  logo_url: { type: String },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

export const Operator = mongoose.model<IOperator>('Operator', operatorSchema);