// config/db.ts
import mongoose from 'mongoose';
import { config, logger } from './bootstrap.js';

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(config.mongoUri, {
      maxPoolSize: 100, // Handle more concurrent users
      minPoolSize: 10,  // Keep some connections ready
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 5000,
    });
    logger.info('🚀 MongoDB connected with Optimized Pool (size: 10-100)');
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  }
};
