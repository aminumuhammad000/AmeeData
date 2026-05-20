import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User, VirtualAccount } from '../models/index.js';
import { vtStackService } from '../services/vtstack.service.js';
dotenv.config();
async function migrateToVTStack() {
    try {
        console.log('🚀 Starting Migration to VTStack Virtual Accounts...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');
        // 1. Find all users
        const users = await User.find({});
        console.log(`👤 Found ${users.length} total users`);
        let migratedCount = 0;
        let skippedCount = 0;
        let errorCount = 0;
        for (const user of users) {
            try {
                // Check if user already has a VTStack account
                const existingVTAccount = await VirtualAccount.findOne({
                    user: user._id,
                    provider: 'vtstack'
                });
                if (existingVTAccount) {
                    console.log(`⏭️ User ${user.email} already has VTStack account`);
                    skippedCount++;
                    continue;
                }
                console.log(`🏦 Creating VTStack account for ${user.email}...`);
                const reference = vtStackService.generateReference(user._id.toString());
                const vtAccount = await vtStackService.createVirtualAccount({
                    firstName: user.first_name,
                    lastName: user.last_name,
                    email: user.email,
                    phone: user.phone_number || '08000000000',
                    bvn: user.bvn || '22222222222',
                    identityType: 'INDIVIDUAL',
                    reference: reference
                });
                // Create local record
                await VirtualAccount.create({
                    user: user._id,
                    accountNumber: vtAccount.accountNumber,
                    accountName: vtAccount.accountName,
                    bankName: vtAccount.bankName || 'PalmPay',
                    provider: 'vtstack',
                    reference: vtAccount.reference,
                    status: 'active',
                    metadata: {
                        alias: vtAccount.alias,
                        id: vtAccount.id
                    }
                });
                console.log(`✅ Migrated ${user.email}`);
                migratedCount++;
            }
            catch (error) {
                console.error(`❌ Failed to migrate ${user.email}:`, error.message);
                errorCount++;
            }
        }
        console.log('\n📊 Migration Summary:');
        console.log(`- Migrated: ${migratedCount}`);
        console.log(`- Skipped (Already exists): ${skippedCount}`);
        console.log(`- Errors: ${errorCount}`);
    }
    catch (error) {
        console.error('❌ Migration failed:', error.message);
    }
    finally {
        await mongoose.disconnect();
        console.log('👋 Disconnected');
    }
}
migrateToVTStack();
