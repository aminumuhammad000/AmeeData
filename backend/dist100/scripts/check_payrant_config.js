import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ProviderConfig from '../models/provider.model.js';
dotenv.config();
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vtfree';
async function checkConfig() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');
        const provider = await ProviderConfig.findOne({ code: 'payrant' });
        console.log('--- Environment Variables ---');
        console.log('PAYRANT_API_KEY:', process.env.PAYRANT_API_KEY ? 'Set' : 'Not Set');
        console.log('PAYRANT_WEBHOOK_SECRET:', process.env.PAYRANT_WEBHOOK_SECRET ? 'Set' : 'Not Set');
        console.log('PAYRANT_BASE_URL:', process.env.PAYRANT_BASE_URL);
        console.log('\n--- Database Configuration ---');
        if (provider) {
            console.log('Provider found in DB');
            console.log('API Key:', provider.api_key ? 'Set' : 'Not Set');
            console.log('Secret Key:', provider.secret_key ? 'Set' : 'Not Set');
            console.log('Base URL:', provider.base_url);
            console.log('Metadata Env:', provider.metadata?.env);
        }
        else {
            console.log('Provider NOT found in DB');
        }
    }
    catch (error) {
        console.error('Error:', error);
    }
    finally {
        await mongoose.disconnect();
    }
}
checkConfig();
