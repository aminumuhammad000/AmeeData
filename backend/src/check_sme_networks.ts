
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import smeplugService from './services/smeplug.service.js';

dotenv.config();

const checkNetworks = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/connecta_vtu');
        console.log('Connected to MongoDB');

        console.log('Fetching SME Plug Networks...');
        const res = await smeplugService.getNetworks();
        console.log(JSON.stringify(res, null, 2));

        process.exit(0);
    } catch (error: any) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Response:', error.response.data);
        }
        process.exit(1);
    }
};

checkNetworks();
