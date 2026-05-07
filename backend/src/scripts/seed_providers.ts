import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { config } from '../config/bootstrap.js';
import ProviderConfig from '../models/provider.model.js';
import logger from '../utils/logger.js';

dotenv.config();

const PROVIDERS = [
  {
    name: 'Topupmate',
    code: 'topupmate',
    base_url: 'https://connect.topupmate.com/api',
    api_key: process.env.TOPUPMATE_API_KEY || '',
    secret_key: '',
    username: '',
    password: '',
    active: false,
    priority: 2,
    supported_services: ['airtime', 'data', 'cable', 'electricity', 'exampin'],
    metadata: {
      env: {
        TOPUPMATE_API_KEY: process.env.TOPUPMATE_API_KEY || ''
      }
    }
  },
  {
    name: 'SME Plug',
    code: 'smeplug',
    base_url: 'https://smeplug.ng/api',
    api_key: process.env.SMEPLUG_API_KEY || 'acc5a5e0c43bcd66498b0bf68aa38f2bf3290019e09f7305f6d158106f09475f',
    secret_key: '',
    username: '',
    password: '',
    active: true,
    priority: 1,
    supported_services: ['airtime', 'data'],
    metadata: {
      env: {
        SMEPLUG_API_KEY: process.env.SMEPLUG_API_KEY || 'acc5a5e0c43bcd66498b0bf68aa38f2bf3290019e09f7305f6d158106f09475f'
      }
    }
  }
];

async function run() {
  try {
    const mongoUrl = config.mongoUri;
    await mongoose.connect(mongoUrl);
    logger.info('Connected to MongoDB');

    for (const p of PROVIDERS) {
      const exists = await ProviderConfig.findOne({ code: p.code });
      if (exists) {
        await ProviderConfig.updateOne({ _id: exists._id }, { $set: p });
        logger.info(`Updated provider: ${p.code}`);
      } else {
        await ProviderConfig.create(p as any);
        logger.info(`Inserted provider: ${p.code}`);
      }
    }

    console.log(`✅ Providers seeded/updated: ${PROVIDERS.length}`);
  } catch (err) {
    logger.error('Error seeding providers:', err);
    console.error('❌ Error seeding providers:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB');
  }
}

run();
