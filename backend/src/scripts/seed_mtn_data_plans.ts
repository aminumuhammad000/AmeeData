import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { config } from '../config/bootstrap.js';
import AirtimePlan from '../models/airtime_plan.model.js';
import logger from '../utils/logger.js';

dotenv.config();

const MTN_PLANS = [
    // Category 1: SME Plans (Active)
    { name: '500MB SME', externalPlanId: 172, price: 300, active: true },
    { name: '1GB SME', externalPlanId: 173, price: 460, active: true },
    { name: '2GB SME', externalPlanId: 174, price: 900, active: true },
    { name: '3GB SME', externalPlanId: 175, price: 1240, active: true },
    { name: '5GB SME', externalPlanId: 176, price: 2000, active: true },

    // Category 2: Gifting & Social/Gifting Plans (Active)
    { name: '20MB Facebook Daily (Social/Gifting)', externalPlanId: 239, price: 35, active: true },
    { name: '40MB WhatsApp Weekly (Social/Gifting)', externalPlanId: 247, price: 70, active: true },
    { name: '40MB Facebook Weekly (Social/Gifting)', externalPlanId: 246, price: 70, active: true },
    { name: '20MB WhatsApp Daily (Social/Gifting)', externalPlanId: 240, price: 37, active: true },
    { name: '75MB Daily (Gifting)', externalPlanId: 6, price: 90, active: true },
    { name: '40MB Ayoba Weekly (Social/Gifting)', externalPlanId: 248, price: 70, active: true },
    { name: '200MB All Social Daily (Gifting)', externalPlanId: 265, price: 125, active: true },
    { name: '100MB Daily (Gifting)', externalPlanId: 7, price: 120, active: true },
    { name: '470MB All Social Weekly (Gifting)', externalPlanId: 266, price: 230, active: true },
    { name: '120MB Facebook Monthly (Social/Gifting)', externalPlanId: 244, price: 200, active: true },
    { name: '110MB Daily (Gifting)', externalPlanId: 230, price: 120, active: true },
    { name: '1.2GB All Social Monthly (Gifting)', externalPlanId: 256, price: 500, active: true },
    { name: '500MB Daily (Gifting)', externalPlanId: 264, price: 450, active: true },

    // Category 3: Other Data Plans (Active)
    { name: '2GB 2-Day Plan', externalPlanId: 227, price: 800, active: true },
    { name: '1.5GB 2-Day Plan', externalPlanId: 231, price: 650, active: true },
    { name: '3.2GB 2-Day Plan', externalPlanId: 229, price: 1100, active: true },
    { name: '7GB 2-Day Plan', externalPlanId: 445, price: 1900, active: true },
    { name: '500MB Weekly', externalPlanId: 258, price: 550, active: true },
    { name: '1GB Weekly', externalPlanId: 15, price: 850, active: true },
    { name: '1.2GB Pulse Weekly', externalPlanId: 238, price: 800, active: true },
    { name: '1.5GB Weekly', externalPlanId: 16, price: 1100, active: true },
    { name: '3.5GB Weekly', externalPlanId: 261, price: 1600, active: true },
    { name: '6GB Weekly', externalPlanId: 17, price: 2650, active: true },
    { name: '7GB Monthly', externalPlanId: 21, price: 3700, active: true },
    { name: '20GB Monthly', externalPlanId: 25, price: 8000, active: true },
    { name: '25GB Monthly', externalPlanId: 26, price: 9550, active: true },
    { name: '30GB Monthly', externalPlanId: 120, price: 10000, active: true },
    { name: '36GB Monthly', externalPlanId: 27, price: 12300, active: true },
    { name: '40GB Postpaid (2 Months)', externalPlanId: 235, price: 10000, active: true },
    { name: '60GB Monthly', externalPlanId: 121, price: 15500, active: true },
    { name: '65GB Monthly', externalPlanId: 329, price: 17200, active: true },
    { name: '75GB Monthly', externalPlanId: 28, price: 19500, active: true },
    { name: '165GB Monthly', externalPlanId: 29, price: 37000, active: true },
    { name: '200GB (2 Months)', externalPlanId: 32, price: 52500, active: true },
    { name: '250GB Monthly', externalPlanId: 30, price: 57000, active: true },

    // Other Plans (Inactive)
    { name: '150MB TikTok Daily Plan [Social] [Gifting]', externalPlanId: 242, price: 49, active: false },
    { name: '500MB Pulse Nightlife bundle [Social] [Gifting]', externalPlanId: 241, price: 73, active: false },
    { name: '120MB WhatsApp Monthly Plan [Social] [Gifting]', externalPlanId: 245, price: 146, active: false },
    { name: '200MB 2-Day Plan [Gifting]', externalPlanId: 9, price: 194, active: false },
    { name: '250MB 2-Day Plan [Gifting]', externalPlanId: 10, price: 194, active: false },
    { name: '230MB Daily Plan [Gifting]', externalPlanId: 237, price: 194, active: false },
    { name: '4 hrs YouTube Buffet Daily Bundle [Social] [Gifting]', externalPlanId: 243, price: 243, active: false },
    { name: '1GB IG/TT/YT Weekly Plan [Soclai] [Gifting]', externalPlanId: 249, price: 291, active: false },
    { name: '2GB TikTok Weekly Plan [Social] [Gifting]', externalPlanId: 250, price: 388, active: false },
    { name: '750MB + Free 1hr (YT/IG/TT) [Gifting] / 3 Days', externalPlanId: 8, price: 437, active: false },
    { name: '750MB + Free 1hr (YT/IG/TT) [Gifting]', externalPlanId: 12, price: 437, active: false },
    { name: '1GB+1.5mins Daily Plan [Gifting]', externalPlanId: 11, price: 485, active: false },
    { name: 'XtraData 500 - 600MB - Weekly [Gifting]', externalPlanId: 269, price: 485, active: false },
    { name: 'XtraData More 600 Daily [Gifting]', externalPlanId: 267, price: 582, active: false },
    { name: '2.5GB 2-Day Plan [Gifting]', externalPlanId: 13, price: 873, active: false },
    { name: 'XtraData More 1000 Daily [Gifting]', externalPlanId: 268, price: 970, active: false },
    { name: '3.2GB 2-Day Plan [Gifting]', externalPlanId: 229, price: 970, active: false },
    { name: 'XtraData 1500 - 1.8GB - Monthly [Gifting]', externalPlanId: 271, price: 1455, active: false },
    { name: '2GB+2mins Monthly Plan [Gifting]', externalPlanId: 18, price: 1455, active: false },
    { name: '2.7GB+2mins Monthly Plan [Gifting]', externalPlanId: 19, price: 1940, active: false },
    { name: 'XtraData More 2500 - 6GB - Weekly [Gifting]', externalPlanId: 270, price: 2425, active: false },
    { name: '3.5GB+5mins Monthly Plan [Gifting]', externalPlanId: 20, price: 2425, active: false },
    { name: 'XtraData 3000 - 5.5GB - Monthly [Gifting]', externalPlanId: 272, price: 2910, active: false },
    { name: '6.75GB Value Data Plan Monthly [Gifting]', externalPlanId: 232, price: 2910, active: false },
    { name: '11GB (Digital Bundle) - 7 Days', externalPlanId: 226, price: 3430, active: false },
    { name: '10GB + 10mins Monthly Plan [Gifting]', externalPlanId: 22, price: 4365, active: false },
    { name: '14.5GB Value Data Monthly Plan [Gifting]', externalPlanId: 233, price: 4850, active: false },
    { name: 'XtraData 5500 - 12.5GB - Monthly [Gifting]', externalPlanId: 274, price: 5335, active: false },
    { name: '12.5 Monthly Plan [Gifting]', externalPlanId: 23, price: 5335, active: false },
    { name: '16.5GB+10mins Monthly Plan [Gifting]', externalPlanId: 24, price: 6305, active: false },
    { name: '35GB Postpaid Monthly [Gifting]', externalPlanId: 234, price: 6790, active: false },
    { name: '30GB Monthly Broadband Plan - Monthly', externalPlanId: 120, price: 8730, active: false },
    { name: 'XtraData 11000 Monthly [Gifting]', externalPlanId: 275, price: 10670, active: false },
    { name: '60GB Monthly Broadband Plan - Monthly', externalPlanId: 121, price: 14065, active: false },
    { name: '65GB Monthly Plan', externalPlanId: 393, price: 16000, active: false },
    { name: '120GB Monthly Broadband Plan', externalPlanId: 412, price: 24000, active: false },
    { name: '90GB 2-Month [Gifting]', externalPlanId: 236, price: 24250, active: false },
    { name: 'Silver (150GB FUP Monthly Unlimited) Broadband - Monthly', externalPlanId: 123, price: 29100, active: false },
    { name: '200GB Monthly Broadband Plan', externalPlanId: 124, price: 36375, active: false },
    { name: '150GB 2-Month Plan [Gifting]', externalPlanId: 31, price: 38800, active: false },
    { name: 'Ruby (300GB FUP Monthly Unlimited) Broadband', externalPlanId: 125, price: 43650, active: false },
    { name: '450GB HyNetFlex - 3 Monthly', externalPlanId: 129, price: 75000, active: false },
    { name: '450GB 3-Month Broadband Plan', externalPlanId: 413, price: 75000, active: false },
    { name: '480GB 3-Month Plan', externalPlanId: 405, price: 90000, active: false },
    { name: '800GB Yearly Plan [Gifting]', externalPlanId: 263, price: 121250, active: false },
    { name: '1.5TB Yearly Broadband', externalPlanId: 414, price: 225000, active: false },
    { name: '25GB [Corporate] - 30 Days', externalPlanId: 133, price: 0, active: false },
    { name: '30GB [Corporate] - 30 Days', externalPlanId: 134, price: 0, active: false },
    { name: '50GB [Corporate] - 30 Days', externalPlanId: 135, price: 0, active: false },
    { name: '500MB Share - Weekly', externalPlanId: 423, price: 300, active: false },
    { name: '1GB Share - Weekly', externalPlanId: 424, price: 410, active: false },
    { name: '50MB Share', externalPlanId: 169, price: 0, active: false },
    { name: '2GB Share - Weekly', externalPlanId: 425, price: 820, active: false },
    { name: '100MB Share', externalPlanId: 170, price: 250, active: false },
    { name: '3GB Share - Weekly', externalPlanId: 426, price: 1230, active: false },
    { name: '200MB Share', externalPlanId: 171, price: 0, active: false },
    { name: '5GB Share - Weekly', externalPlanId: 427, price: 2000, active: false },
    { name: '500MB Share', externalPlanId: 172, price: 395, active: false },
    { name: '1GB Share', externalPlanId: 173, price: 550, active: false },
    { name: '2GB Share', externalPlanId: 174, price: 1090, active: false },
    { name: '3GB Share', externalPlanId: 175, price: 1590, active: false },
    { name: '5GB Share', externalPlanId: 176, price: 2450, active: false },
    { name: '2.5GB - 1Day Plan [Gifting]', externalPlanId: 228, price: 728, active: false },
    { name: '20GB Weekly Plan [Gifting]', externalPlanId: 262, price: 4850, active: false },
    { name: 'ThryveData 1500 (1.8GB + 35 minutes) - Gifting', externalPlanId: 259, price: 1455, active: false },
    { name: 'ThryveData 3000 5GB [Gifting]', externalPlanId: 260, price: 2910, active: false },
];

async function run() {
    try {
        const mongoUrl = config.mongoUri;
        await mongoose.connect(mongoUrl);
        logger.info('Connected to MongoDB');

        // MTN Provider ID is 1
        const PROVIDER_ID = 1;
        const PROVIDER_NAME = 'MTN';

        // Clear existing MTN data plans to avoid duplicates/conflicts
        await AirtimePlan.deleteMany({ providerId: PROVIDER_ID, type: 'DATA' });
        logger.info('Cleared existing MTN data plans');

        for (const plan of MTN_PLANS) {
            await AirtimePlan.create({
                providerId: PROVIDER_ID,
                providerName: PROVIDER_NAME,
                externalPlanId: plan.externalPlanId,
                code: String(plan.externalPlanId), // Use externalPlanId as code too
                name: plan.name,
                price: plan.price,
                type: 'DATA',
                active: plan.active,
                meta: {
                    data_value: String(plan.externalPlanId), // For frontend compatibility
                    validity: plan.name.includes('Weekly') ? 'Weekly' : plan.name.includes('Monthly') ? 'Monthly' : plan.name.includes('Daily') ? 'Daily' : 'Custom'
                }
            });
            logger.info(`Inserted plan: ${plan.name} (${plan.externalPlanId})`);
        }

        console.log(`✅ MTN Data Plans seeded: ${MTN_PLANS.length}`);
    } catch (err) {
        logger.error('Error seeding MTN data plans:', err);
        console.error('❌ Error seeding MTN data plans:', err);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        logger.info('Disconnected from MongoDB');
    }
}

run();
