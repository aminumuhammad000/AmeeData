import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User, VirtualAccount } from '../models/index.js';
import { SystemSetting } from '../models/system_setting.model.js';
import { vtStackService } from '../services/vtstack.service.js';
dotenv.config();
async function testVTStack() {
    try {
        console.log('🚀 Starting VTStack Virtual Account Test...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');
        // 1. Check if VTStack is configured
        const setting = await SystemSetting.findOne({ type: 'global_config' });
        const gateway = setting?.config?.payment_gateway;
        console.log('⚙️ Current Gateway:', gateway);
        // 2. Find a test user
        const user = await User.findOne({ email: { $exists: true } });
        if (!user) {
            console.error('❌ No user found for testing');
            process.exit(1);
        }
        console.log('👤 Testing with user:', user.email);
        // 3. Simulate virtual account creation
        // Note: This requires a real BVN in a real scenario, but we'll use a placeholder if testing mock
        const testBvn = '12345678901'; // Replace with real BVN for live test
        const reference = vtStackService.generateReference(user._id.toString());
        console.log('🏦 Attempting to create VTStack account...');
        try {
            const vtAccount = await vtStackService.createVirtualAccount({
                firstName: user.first_name,
                lastName: user.last_name,
                email: user.email,
                phone: user.phone_number || '08000000000',
                bvn: testBvn,
                identityType: 'INDIVIDUAL',
                reference: reference
            });
            console.log('✅ VTStack account created successfully:', vtAccount);
            // 4. Verify local record
            const localAccount = await VirtualAccount.findOne({ reference: vtAccount.reference });
            if (localAccount) {
                console.log('✅ Local record found:', localAccount.accountNumber);
            }
            else {
                console.log('⚠️ Local record NOT found (this might be expected if not saved in service)');
            }
        }
        catch (error) {
            console.error('❌ VTStack creation failed:', error.message);
        }
    }
    catch (error) {
        console.error('❌ Test failed:', error.message);
    }
    finally {
        await mongoose.disconnect();
        console.log('👋 Disconnected');
    }
}
testVTStack();
