import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { config } from '../config/bootstrap.js';
import AirtimePlan from '../models/airtime_plan.model.js';
import ProviderConfig from '../models/provider.model.js';
import logger from '../utils/logger.js';

dotenv.config();

async function verifySeeding() {
    try {
        const mongoUrl = config.mongoUri;
        await mongoose.connect(mongoUrl);
        logger.info('Connected to MongoDB');

        // Check Providers
        const providers = await ProviderConfig.find({});
        console.log('\n📦 PROVIDERS:');
        console.log(`   Total: ${providers.length}`);
        providers.forEach(p => {
            console.log(`   - ${p.name} (${p.code}): ${p.active ? '✅ Active' : '❌ Inactive'} | Priority: ${p.priority}`);
        });

        // Check Data Plans
        const allPlans = await AirtimePlan.find({ type: 'DATA' });
        const activePlans = await AirtimePlan.find({ type: 'DATA', active: true });
        const mtnPlans = await AirtimePlan.find({ providerId: 1, type: 'DATA' });
        const mtnActivePlans = await AirtimePlan.find({ providerId: 1, type: 'DATA', active: true });

        console.log('\n📊 DATA PLANS:');
        console.log(`   Total Plans: ${allPlans.length}`);
        console.log(`   Active Plans: ${activePlans.length}`);
        console.log(`   MTN Plans: ${mtnPlans.length}`);
        console.log(`   MTN Active Plans: ${mtnActivePlans.length}`);

        // Show some sample active MTN plans
        console.log('\n📱 SAMPLE ACTIVE MTN PLANS:');
        const samplePlans = mtnActivePlans.slice(0, 10);
        samplePlans.forEach(p => {
            console.log(`   - ${p.name}: ₦${p.price} (Plan ID: ${p.externalPlanId})`);
        });

        console.log('\n✅ Verification Complete!');

    } catch (err) {
        logger.error('Error during verification:', err);
        console.error('❌ Error during verification:', err);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        logger.info('Disconnected from MongoDB');
    }
}

verifySeeding();
