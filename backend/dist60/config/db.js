// config/db.ts
import mongoose from 'mongoose';
import { config, logger } from './bootstrap.js';
export const connectDB = async () => {
    try {
        await mongoose.connect(config.mongoUri);
        logger.info('MongoDB connected successfully');
    }
    catch (error) {
        logger.error('MongoDB connection error:', error);
        process.exit(1);
    }
};
