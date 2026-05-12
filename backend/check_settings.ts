
import mongoose from 'mongoose';
import { SystemSetting } from './src/models/system_setting.model';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/connecta_vtu';

async function checkSettings() {
    try {
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');
        
        const settings = await SystemSetting.findOne({ type: 'global_config' });
        console.log('Current Global Config:');
        console.log(JSON.stringify(settings, null, 2));
        
        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkSettings();
