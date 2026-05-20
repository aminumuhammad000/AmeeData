// scripts/list-providers.ts
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import ProviderConfig from '../models/provider.model.js';
dotenv.config();
const listProviders = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/connecta_vtu');
        const providers = await ProviderConfig.find({});
        console.log('--- All Providers ---');
        providers.forEach(p => {
            console.log(`Code: ${p.code}, Name: ${p.name}, Active: ${p.active}, Priority: ${p.priority}, Services: ${p.supported_services.join(', ')}`);
        });
        process.exit(0);
    }
    catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};
listProviders();
