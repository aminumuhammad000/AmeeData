import mongoose from 'mongoose';

// Connect to MongoDB
await mongoose.connect('mongodb://localhost:27017/connecta_vtu');

const walletSchema = new mongoose.Schema({
  user_id: mongoose.Schema.Types.ObjectId,
  balance: Number,
  currency: String,
  last_transaction_at: Date
});

const Wallet = mongoose.model('Wallet', walletSchema);

// Update user's wallet
const userId = '690c7de84d4df744806907b2';
const amount = 10000;

const result = await Wallet.findOneAndUpdate(
  { user_id: new mongoose.Types.ObjectId(userId) },
  { 
    $inc: { balance: amount },
    $set: { last_transaction_at: new Date() }
  },
  { new: true }
);

console.log('✅ Wallet updated:', result);
await mongoose.disconnect();
