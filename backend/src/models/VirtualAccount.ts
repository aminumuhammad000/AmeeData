import mongoose, { Document, Schema } from 'mongoose';

export interface IVirtualAccount extends Document {
  user: mongoose.Types.ObjectId;
  accountNumber: string;
  accountName: string;
  bankName: string;
  provider: string;
  reference: string;
  status: string;
  metadata: {
    virtualAccountName?: string;
    virtualAccountNo?: string;
    identityType?: string;
    licenseNumber?: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const VirtualAccountSchema = new Schema<IVirtualAccount>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    accountNumber: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    accountName: {
      type: String,
      required: true
    },
    bankName: {
      type: String,
      default: 'PalmPay',
      required: true
    },
    provider: {
      type: String,
      default: 'payrant',
      enum: ['payrant', 'monnify', 'flutterwave', 'vtpay', 'vtstack'],
      required: true
    },
    reference: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    status: {
      type: String,
      default: 'active',
      enum: ['active', 'inactive', 'suspended'],
      required: true
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {}
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc: any, ret: any) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Create a compound index for user and provider to ensure one account per provider per user
VirtualAccountSchema.index({ user: 1, provider: 1 }, { unique: true });

export default mongoose.model<IVirtualAccount>('VirtualAccount', VirtualAccountSchema);
