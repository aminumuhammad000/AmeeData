import mongoose from 'mongoose';
import dotenv from 'dotenv';
// Configure dotenv
dotenv.config();
// Schema definition (simplified for the script)
const AirtimePlanSchema = new mongoose.Schema({
    providerId: Number,
    providerName: String,
    name: String,
}, { strict: false });
const AirtimePlan = mongoose.model('AirtimePlan', AirtimePlanSchema, 'airtimeplans');
async function fixDatabase() {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/connecta_vtu';
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(mongoUri);
        console.log('Connected successfully.');
        const mapping = [
            { name: /mtn/i, id: 1, provider: 'MTN' },
            { name: /airtel/i, id: 2, provider: 'AIRTEL' },
            { name: /glo/i, id: 3, provider: 'GLO' },
            { name: /9mobile/i, id: 4, provider: '9MOBILE' },
            { name: /etisalat/i, id: 4, provider: '9MOBILE' },
        ];
        let totalFixed = 0;
        for (const rule of mapping) {
            console.log(`Checking plans for ${rule.provider}...`);
            // Find all plans that should belong to this provider based on name
            const plans = await AirtimePlan.find({ name: rule.name });
            for (const plan of plans) {
                if (plan.providerId !== rule.id || plan.providerName !== rule.provider) {
                    console.log(`Fixing plan: "${plan.name}" (Current ID: ${plan.providerId}, New ID: ${rule.id})`);
                    await AirtimePlan.findByIdAndUpdate(plan._id, {
                        providerId: rule.id,
                        providerName: rule.provider
                    });
                    totalFixed++;
                }
            }
        }
        console.log(`\nMaintenance complete. Total plans fixed: ${totalFixed}`);
        await mongoose.disconnect();
        process.exit(0);
    }
    catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}
fixDatabase();
