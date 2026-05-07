
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { ProviderConfig } from './models/provider.model.js';

dotenv.config();

const checkProviders = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/connecta_vtu');
    console.log('Connected to MongoDB');

    const providers = await ProviderConfig.find({}).sort({ priority: 1 });

    console.log('\n--- All Providers ---');
    providers.forEach(p => {
      console.log(`[${p.active ? 'ACTIVE' : 'INACTIVE'}] ${p.name} (${p.code}) - Priority: ${p.priority}`);
      console.log(`  Services: ${p.supported_services.join(', ')}`);
    });

    const activeAirtime = await ProviderConfig.findOne({
      active: true,
      supported_services: { $in: ['airtime'] }
    }).sort({ priority: 1 });

    console.log('\n--- Preferred Airtime Provider ---');
    if (activeAirtime) {
      console.log(`Name: ${activeAirtime.name} (${activeAirtime.code})`);
    } else {
      console.log('No active airtime provider found (will fallback to default)');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkProviders();
