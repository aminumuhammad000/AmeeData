import mongoose, { Schema } from 'mongoose';
const ProviderSchema = new Schema({
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true, index: true },
    base_url: { type: String },
    api_key: { type: String },
    secret_key: { type: String },
    username: { type: String },
    password: { type: String },
    active: { type: Boolean, default: true },
    priority: { type: Number, default: 1, index: true },
    supported_services: { type: [String], default: [] },
    metadata: { type: Schema.Types.Mixed },
}, { timestamps: true });
ProviderSchema.index({ active: 1, priority: 1 });
export const ProviderConfig = mongoose.model('ProviderConfig', ProviderSchema);
export default ProviderConfig;
