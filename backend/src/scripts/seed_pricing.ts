import dotenv from 'dotenv';
import mongoose from 'mongoose';
import AirtimePlan from '../models/airtime_plan.model.js';
import logger from '../utils/logger.js';
import { config } from '../config/bootstrap.js';

dotenv.config();

const PRICING_DATA = [
  // MTN DATA PLANS
  { providerId: 1, providerName: 'MTN', externalPlanId: 51, code: 'MTN500MB', name: 'MTN 500 MB (SME) (7 days)', price: 500, type: 'DATA' },
  { providerId: 1, providerName: 'MTN', externalPlanId: 52, code: 'MTN1GB', name: 'MTN 1 GB (SME) (30 days)', price: 1000, type: 'DATA' },
  { providerId: 1, providerName: 'MTN', externalPlanId: 53, code: 'MTN2GB', name: 'MTN 2 GB (SME) (30 days)', price: 2000, type: 'DATA' },
  { providerId: 1, providerName: 'MTN', externalPlanId: 54, code: 'MTN3GB', name: 'MTN 3 GB (SME) (30 days)', price: 3000, type: 'DATA' },
  { providerId: 1, providerName: 'MTN', externalPlanId: 55, code: 'MTN4GB', name: 'MTN 4 GB (SME) (30 days)', price: 4000, type: 'DATA' },
  { providerId: 1, providerName: 'MTN', externalPlanId: 56, code: 'MTN5GB', name: 'MTN 5 GB (SME) (30 days)', price: 5000, type: 'DATA' },

  // AIRTEL DATA PLANS
  { providerId: 2, providerName: 'AIRTEL', externalPlanId: 70, code: 'ARL500MB', name: 'AIRTEL 500 MB (7 days)', price: 500, type: 'DATA' },
  { providerId: 2, providerName: 'AIRTEL', externalPlanId: 71, code: 'ARL1GB', name: 'AIRTEL 1 GB (30 days)', price: 1000, type: 'DATA' },
  { providerId: 2, providerName: 'AIRTEL', externalPlanId: 72, code: 'ARL2GB', name: 'AIRTEL 2 GB (30 days)', price: 2000, type: 'DATA' },
  { providerId: 2, providerName: 'AIRTEL', externalPlanId: 73, code: 'ARL3GB', name: 'AIRTEL 3 GB (30 days)', price: 3000, type: 'DATA' },
  { providerId: 2, providerName: 'AIRTEL', externalPlanId: 74, code: 'ARL4GB', name: 'AIRTEL 4 GB (30 days)', price: 4000, type: 'DATA' },
  { providerId: 2, providerName: 'AIRTEL', externalPlanId: 75, code: 'ARL5GB', name: 'AIRTEL 5 GB (30 days)', price: 5000, type: 'DATA' },

  // GLO DATA PLANS
  { providerId: 3, providerName: 'GLO', externalPlanId: 90, code: 'GLO500MB', name: 'GLO 500 MB (7 days)', price: 500, type: 'DATA' },
  { providerId: 3, providerName: 'GLO', externalPlanId: 91, code: 'GLO1GB', name: 'GLO 1 GB (30 days)', price: 1000, type: 'DATA' },
  { providerId: 3, providerName: 'GLO', externalPlanId: 92, code: 'GLO2GB', name: 'GLO 2 GB (30 days)', price: 2000, type: 'DATA' },
  { providerId: 3, providerName: 'GLO', externalPlanId: 93, code: 'GLO3GB', name: 'GLO 3 GB (30 days)', price: 3000, type: 'DATA' },
  { providerId: 3, providerName: 'GLO', externalPlanId: 94, code: 'GLO4GB', name: 'GLO 4 GB (30 days)', price: 4000, type: 'DATA' },
  { providerId: 3, providerName: 'GLO', externalPlanId: 95, code: 'GLO5GB', name: 'GLO 5 GB (30 days)', price: 5000, type: 'DATA' },

  // 9MOBILE DATA PLANS
  { providerId: 4, providerName: '9MOBILE', externalPlanId: 110, code: '9M500MB', name: '9MOBILE 500 MB (7 days)', price: 500, type: 'DATA' },
  { providerId: 4, providerName: '9MOBILE', externalPlanId: 111, code: '9M1GB', name: '9MOBILE 1 GB (30 days)', price: 1000, type: 'DATA' },
  { providerId: 4, providerName: '9MOBILE', externalPlanId: 112, code: '9M2GB', name: '9MOBILE 2 GB (30 days)', price: 2000, type: 'DATA' },
  { providerId: 4, providerName: '9MOBILE', externalPlanId: 113, code: '9M3GB', name: '9MOBILE 3 GB (30 days)', price: 3000, type: 'DATA' },
  { providerId: 4, providerName: '9MOBILE', externalPlanId: 114, code: '9M4GB', name: '9MOBILE 4 GB (30 days)', price: 4000, type: 'DATA' },
  { providerId: 4, providerName: '9MOBILE', externalPlanId: 115, code: '9M5GB', name: '9MOBILE 5 GB (30 days)', price: 5000, type: 'DATA' },

  // AIRTIME PLANS - MTN
  { providerId: 1, providerName: 'MTN', code: 'MTN100', name: 'MTN ₦100 Airtime', price: 100, type: 'AIRTIME' },
  { providerId: 1, providerName: 'MTN', code: 'MTN200', name: 'MTN ₦200 Airtime', price: 200, type: 'AIRTIME' },
  { providerId: 1, providerName: 'MTN', code: 'MTN500', name: 'MTN ₦500 Airtime', price: 500, type: 'AIRTIME' },
  { providerId: 1, providerName: 'MTN', code: 'MTN1000', name: 'MTN ₦1,000 Airtime', price: 1000, type: 'AIRTIME' },
  { providerId: 1, providerName: 'MTN', code: 'MTN2000', name: 'MTN ₦2,000 Airtime', price: 2000, type: 'AIRTIME' },
  { providerId: 1, providerName: 'MTN', code: 'MTN5000', name: 'MTN ₦5,000 Airtime', price: 5000, type: 'AIRTIME' },
  { providerId: 1, providerName: 'MTN', code: 'MTN10000', name: 'MTN ₦10,000 Airtime', price: 10000, type: 'AIRTIME' },

  // AIRTIME PLANS - AIRTEL
  { providerId: 2, providerName: 'AIRTEL', code: 'ARL100', name: 'AIRTEL ₦100 Airtime', price: 100, type: 'AIRTIME' },
  { providerId: 2, providerName: 'AIRTEL', code: 'ARL200', name: 'AIRTEL ₦200 Airtime', price: 200, type: 'AIRTIME' },
  { providerId: 2, providerName: 'AIRTEL', code: 'ARL500', name: 'AIRTEL ₦500 Airtime', price: 500, type: 'AIRTIME' },
  { providerId: 2, providerName: 'AIRTEL', code: 'ARL1000', name: 'AIRTEL ₦1,000 Airtime', price: 1000, type: 'AIRTIME' },
  { providerId: 2, providerName: 'AIRTEL', code: 'ARL2000', name: 'AIRTEL ₦2,000 Airtime', price: 2000, type: 'AIRTIME' },
  { providerId: 2, providerName: 'AIRTEL', code: 'ARL5000', name: 'AIRTEL ₦5,000 Airtime', price: 5000, type: 'AIRTIME' },
  { providerId: 2, providerName: 'AIRTEL', code: 'ARL10000', name: 'AIRTEL ₦10,000 Airtime', price: 10000, type: 'AIRTIME' },

  // AIRTIME PLANS - GLO
  { providerId: 3, providerName: 'GLO', code: 'GLO100', name: 'GLO ₦100 Airtime', price: 100, type: 'AIRTIME' },
  { providerId: 3, providerName: 'GLO', code: 'GLO200', name: 'GLO ₦200 Airtime', price: 200, type: 'AIRTIME' },
  { providerId: 3, providerName: 'GLO', code: 'GLO500', name: 'GLO ₦500 Airtime', price: 500, type: 'AIRTIME' },
  { providerId: 3, providerName: 'GLO', code: 'GLO1000', name: 'GLO ₦1,000 Airtime', price: 1000, type: 'AIRTIME' },
  { providerId: 3, providerName: 'GLO', code: 'GLO2000', name: 'GLO ₦2,000 Airtime', price: 2000, type: 'AIRTIME' },
  { providerId: 3, providerName: 'GLO', code: 'GLO5000', name: 'GLO ₦5,000 Airtime', price: 5000, type: 'AIRTIME' },
  { providerId: 3, providerName: 'GLO', code: 'GLO10000', name: 'GLO ₦10,000 Airtime', price: 10000, type: 'AIRTIME' },

  // AIRTIME PLANS - 9MOBILE
  { providerId: 4, providerName: '9MOBILE', code: '9M100', name: '9MOBILE ₦100 Airtime', price: 100, type: 'AIRTIME' },
  { providerId: 4, providerName: '9MOBILE', code: '9M200', name: '9MOBILE ₦200 Airtime', price: 200, type: 'AIRTIME' },
  { providerId: 4, providerName: '9MOBILE', code: '9M500', name: '9MOBILE ₦500 Airtime', price: 500, type: 'AIRTIME' },
  { providerId: 4, providerName: '9MOBILE', code: '9M1000', name: '9MOBILE ₦1,000 Airtime', price: 1000, type: 'AIRTIME' },
  { providerId: 4, providerName: '9MOBILE', code: '9M2000', name: '9MOBILE ₦2,000 Airtime', price: 2000, type: 'AIRTIME' },
  { providerId: 4, providerName: '9MOBILE', code: '9M5000', name: '9MOBILE ₦5,000 Airtime', price: 5000, type: 'AIRTIME' },
  { providerId: 4, providerName: '9MOBILE', code: '9M10000', name: '9MOBILE ₦10,000 Airtime', price: 10000, type: 'AIRTIME' },
];

const seedDatabase = async () => {
  try {
    const mongoUrl = config.mongoUri;
    await mongoose.connect(mongoUrl);
    logger.info('Connected to MongoDB');

    // Delete existing plans
    await AirtimePlan.deleteMany({});
    logger.info('Cleared existing plans');

    // Insert new plans
    const result = await AirtimePlan.insertMany(PRICING_DATA);
    logger.info(`Successfully seeded ${result.length} pricing plans`);

    console.log(`✅ Database seeded with ${result.length} plans`);
  } catch (error) {
    logger.error('Error seeding database:', error);
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB');
  }
};

seedDatabase();
