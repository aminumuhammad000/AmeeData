
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { ProviderConfig } from './models/provider.model.js';

dotenv.config();

const configureProviders = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/connecta_vtu');
        console.log('Connected to MongoDB');

        // 1. Configure SME Plug (Active, Priority 1)
        await ProviderConfig.findOneAndUpdate(
            { code: 'smeplug' },
            {
                active: true,
                priority: 1,
                supported_services: ['airtime', 'data']
            },
            { upsert: true, new: true }
        );
        console.log('✅ SME Plug configured: Active, Priority 1');

        // 2. Configure Topupmate (Active, Priority 2 - Fallback)
        await ProviderConfig.findOneAndUpdate(
            { code: 'topupmate' },
            {
                active: true,
                priority: 2,
                supported_services: ['airtime', 'data', 'cable', 'electricity', 'exampin']
            },
            { upsert: true, new: true }
        );
        console.log('✅ Topupmate configured: Active, Priority 2');

        // 3. Configure Payrant (Active, No bill payment services)
        // Payrant is for virtual accounts only, so supported_services should be empty or not include bill types
        await ProviderConfig.findOneAndUpdate(
            { code: 'payrant' },
            {
                active: true,
                priority: 1,
                supported_services: [] // No bill payment services
            },
            { upsert: true, new: true }
        );
        console.log('✅ Payrant configured: No bill payment services');

        // 4. VTpass (Inactive)
        await ProviderConfig.findOneAndUpdate(
            { code: 'vtpass' },
            { active: false },
            { new: true }
        );
        console.log('✅ VTpass configured: Inactive');

        console.log('\n--- Final Provider State ---');
        const providers = await ProviderConfig.find({}).sort({ priority: 1 });
        providers.forEach(p => {
            console.log(`[${p.active ? 'ACTIVE' : 'INACTIVE'}] ${p.name} (${p.code}) - Priority: ${p.priority}`);
            console.log(`  Services: ${p.supported_services.join(', ')}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

configureProviders();
