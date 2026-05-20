import dotenv from 'dotenv';
import ProviderConfig from '../models/provider.model.js';
import mongoose from 'mongoose';
dotenv.config();
async function testElectricity() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/connecta_vtu');
        console.log('✅ Connected to MongoDB');
        // Check if topupmate is in DB
        let cfg = await ProviderConfig.findOne({ code: 'topupmate' });
        if (!cfg) {
            console.log('⚠️ Topupmate config not found in DB. Seeding default...');
            cfg = await ProviderConfig.create({
                name: 'TopupMate',
                code: 'topupmate',
                base_url: 'https://connect.topupmate.com/api',
                active: true,
                supported_services: ['airtime', 'data', 'cable', 'electricity', 'exampin'],
                priority: 1
            });
        }
        console.log('ℹ️ Using Topupmate Config:', JSON.stringify(cfg, null, 2));
        // Test payload structure (Simulation)
        const testPayload = {
            provider: "1",
            meternumber: "24567665767",
            amount: "1000",
            metertype: "prepaid",
            phone: "07032529431",
            ref: "test_ref_" + Date.now()
        };
        console.log('🧪 Simulating purchaseElectricity with payload:', testPayload);
        // We won't actually call it if no API key is set, but we can check the service method
        if (!cfg.api_key) {
            console.log('⚠️ No API key found. Skipping actual API call.');
        }
        else {
            // Uncomment to actually test if you have a key
            // const result = await topupmateService.purchaseElectricity(testPayload);
            // console.log('✅ API Result:', result);
        }
        console.log('✅ Test script completed successfully.');
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Test failed:', error.message);
        process.exit(1);
    }
}
testElectricity();
