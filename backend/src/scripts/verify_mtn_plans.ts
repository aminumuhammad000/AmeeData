import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { config } from '../config/bootstrap.js';
import AirtimePlan from '../models/airtime_plan.model.js';

dotenv.config();

async function run() {
    try {
        const mongoUrl = config.mongoUri;
        await mongoose.connect(mongoUrl);
        console.log('Connected to MongoDB');

        // Fetch active MTN plans
        const activePlans = await AirtimePlan.find({ providerId: 1, type: 'DATA', active: true });
        console.log(`✅ Active MTN Plans: ${activePlans.length}`);

        // Check a few samples
        if (activePlans.length > 0) {
            console.log('Sample Active Plan:', {
                name: activePlans[0].name,
                externalPlanId: activePlans[0].externalPlanId,
                price: activePlans[0].price,
                active: activePlans[0].active
            });
        }

        // Fetch inactive MTN plans
        const inactivePlans = await AirtimePlan.find({ providerId: 1, type: 'DATA', active: false });
        console.log(`✅ Inactive MTN Plans: ${inactivePlans.length}`);

        if (inactivePlans.length > 0) {
            console.log('Sample Inactive Plan:', {
                name: inactivePlans[0].name,
                externalPlanId: inactivePlans[0].externalPlanId,
                price: inactivePlans[0].price,
                active: inactivePlans[0].active
            });
        }

        // Verify a specific plan mentioned by user
        const specificPlan = await AirtimePlan.findOne({ externalPlanId: 239 });
        if (specificPlan) {
            console.log('Specific Plan (239) Check:', {
                name: specificPlan.name,
                active: specificPlan.active,
                price: specificPlan.price
            });
        } else {
            console.error('❌ Plan 239 not found!');
        }

    } catch (err) {
        console.error('❌ Error verifying plans:', err);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

run();
