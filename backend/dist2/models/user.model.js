import mongoose, { Schema } from 'mongoose';
const userSchema = new Schema({
    email: { type: String, required: true, unique: true },
    phone_number: { type: String, required: true, unique: true },
    password_hash: { type: String, required: true },
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    date_of_birth: { type: Date },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String, default: 'Nigeria' },
    profile_picture: { type: String },
    kyc_status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
    kyc_document_id_front_url: { type: String },
    kyc_document_id_back_url: { type: String },
    referral_code: { type: String, unique: true, required: true },
    referred_by: { type: Schema.Types.ObjectId, ref: 'User' },
    biometric_enabled: { type: Boolean, default: false },
    nin: { type: String },
    bvn: { type: String },
    // Store hashed PIN; do not enforce 4-char length on hash
    transaction_pin: { type: String },
    api_key: { type: String, unique: true, sparse: true },
    api_key_enabled: { type: Boolean, default: false },
    virtual_account: {
        account_number: { type: String },
        account_name: { type: String },
        bank_name: { type: String },
        account_reference: { type: String },
        provider: { type: String },
        status: { type: String },
    },
    status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});
export const User = mongoose.model('User', userSchema);
