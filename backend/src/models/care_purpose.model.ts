import mongoose from 'mongoose';

export interface ICarePurpose extends mongoose.Document {
  label: string;
  is_active: boolean;
  icon?: string;
  created_at: Date;
  updated_at: Date;
}

const carePurposeSchema = new mongoose.Schema({
  label: { type: String, required: true, unique: true },
  is_active: { type: Boolean, default: true },
  icon: { type: String, default: 'heart' },
}, { 
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } 
});

export const CarePurpose = mongoose.model<ICarePurpose>('CarePurpose', carePurposeSchema);
