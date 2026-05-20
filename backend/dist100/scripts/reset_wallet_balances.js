// scripts/reset_wallet_balances.ts
import mongoose from 'mongoose';
import { config } from '../config/bootstrap.js';
import { Wallet } from '../models/index.js';
async function resetBalances() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(config.mongoUri);
        console.log('✅ Connected to MongoDB');
        console.log('🔍 Finding all wallets...');
        const totalWallets = await Wallet.countDocuments();
        console.log(`📊 Total wallets to process: ${totalWallets}`);
        if (totalWallets === 0) {
            console.log('⚠️ No wallets found in the database.');
        }
        else {
            console.log('🔄 Resetting all balances to zero...');
            const result = await Wallet.updateMany({}, // Match all documents
            {
                $set: {
                    balance: 0,
                    updated_at: new Date()
                }
            });
            console.log(`✅ Successfully updated ${result.modifiedCount} wallets.`);
        }
        await mongoose.disconnect();
        console.log('\n✅ Done! MongoDB disconnected');
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Error resetting wallet balances:', error);
        process.exit(1);
    }
}
// Start processing
resetBalances();
