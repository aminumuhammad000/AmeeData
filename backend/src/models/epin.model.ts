// models epin.model.ts
import mongoose, { Schema } from 'mongoose';
import { IEPin } from '../types.js';

const epinSchema = new Schema<IEPin>({
  e_pin_product_id: { type: Schema.Types.ObjectId, ref: 'EPinProduct', required: true },
  transaction_id: { type: Schema.Types.ObjectId, ref: 'Transaction', required: true },
  pin_code: { type: String, required: true },
  serial_number: { type: String, required: true },
  status: { type: String, enum: ['available', 'used', 'expired'], default: 'available' },
  purchased_at: { type: Date, default: Date.now },
  used_at: { type: Date }
});

export const EPin = mongoose.model<IEPin>('EPin', epinSchema);