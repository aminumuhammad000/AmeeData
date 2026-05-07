import mongoose, { Document, Schema } from 'mongoose';

export interface IAirtimePlan extends Document {
  providerId: number; // 1=mtn, 2=airtel, 3=glo, 4=9mobile
  providerName: string;
  externalPlanId?: number; // provider's plan id (like 51, 70, ...)
  code?: string; // short code or sku
  name: string; // "MTN 500 MB (SME) (7 days)"
  price: number; // in Naira
  type: 'AIRTIME' | 'DATA'; // AIRTIME or DATA
  discount?: number; // discount percentage
  api_discount?: number; // discount percentage for API users
  meta?: Record<string, any>;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AirtimePlanSchema = new Schema<IAirtimePlan>(
  {
    providerId: { type: Number, required: true, index: true },
    providerName: { type: String, required: true },
    externalPlanId: { type: Number },
    code: { type: String },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    type: { type: String, enum: ['AIRTIME', 'DATA'], required: true, index: true },
    discount: { type: Number, default: 0 },
    api_discount: { type: Number, default: 0 },
    meta: { type: Schema.Types.Mixed },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Index for quick lookups
AirtimePlanSchema.index({ providerId: 1, type: 1, active: 1 });
AirtimePlanSchema.index({ externalPlanId: 1 });

export const AirtimePlan = mongoose.model<IAirtimePlan>('AirtimePlan', AirtimePlanSchema);
export default AirtimePlan;
