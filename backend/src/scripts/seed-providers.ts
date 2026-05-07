// scripts/seed-providers.ts
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import ProviderConfig from '../models/provider.model.js';

dotenv.config();

const seedProviders = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/connecta_vtu');
        console.log('✅ Connected to MongoDB');

        // TopupMate Configuration
        const topupmateConfig = {
            name: 'TopupMate',
            code: 'topupmate',
            base_url: process.env.TOPUPMATE_BASE_URL || 'https://connect.topupmate.com/api',
            api_key: process.env.TOPUPMATE_API_KEY,
            active: true,
            priority: 1,
            supported_services: ['airtime', 'data', 'cable', 'electricity', 'exampin'],
            metadata: {
                description: 'TopupMate VTU Service Provider',
            },
        };

        // Upsert TopupMate configuration
        const result = await ProviderConfig.findOneAndUpdate(
            { code: 'topupmate' },
            topupmateConfig,
            { upsert: true, new: true }
        );

        console.log('✅ TopupMate configuration seeded:', result);

        // Optionally add other providers here (SMEPlug, VTPass, etc.)

        console.log('\n✅ All providers seeded successfully!');
        process.exit(0);
    } catch (error: any) {
        console.error('❌ Error seeding providers:', error.message);
        process.exit(1);
    }
};

seedProviders();
