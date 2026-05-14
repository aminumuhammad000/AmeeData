import mongoose from 'mongoose';
import AirtimePlan from '../models/airtime_plan.model.js';
import dotenv from 'dotenv';
dotenv.config();
async function checkPlans() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ameedata');
        console.log('Connected to MongoDB');
        const plans = await AirtimePlan.find({});
        console.log(`Found ${plans.length} plans total`);
        const mapping = {
            1: 'MTN',
            2: 'AIRTEL',
            3: 'GLO',
            4: '9MOBILE'
        };
        const issues = [];
        for (const plan of plans) {
            const expectedName = mapping[plan.providerId];
            if (!expectedName || plan.providerName.toUpperCase() !== expectedName) {
                issues.push({
                    id: plan._id,
                    name: plan.name,
                    providerId: plan.providerId,
                    providerName: plan.providerName,
                    expectedProviderName: expectedName
                });
            }
        }
        if (issues.length > 0) {
            console.log('Found issues:');
            console.table(issues);
            console.log('Fixing issues...');
            for (const issue of issues) {
                if (issue.expectedProviderName) {
                    await AirtimePlan.findByIdAndUpdate(issue.id, { providerName: issue.expectedProviderName });
                }
            }
            console.log('Finished fixing issues.');
        }
        else {
            console.log('No inconsistent plans found based on ID->Name mapping.');
            // Let's check the other way - maybe the ID is wrong but Name is right?
            console.log('Checking if IDs are wrong based on Name...');
            const nameToId = {
                'MTN': 1,
                'AIRTEL': 2,
                'GLO': 3,
                '9MOBILE': 4
            };
            const idIssues = [];
            for (const plan of plans) {
                const expectedId = nameToId[plan.providerName.toUpperCase()];
                if (expectedId && plan.providerId !== expectedId) {
                    idIssues.push({
                        id: plan._id,
                        name: plan.name,
                        providerId: plan.providerId,
                        providerName: plan.providerName,
                        expectedId: expectedId
                    });
                }
            }
            if (idIssues.length > 0) {
                console.log('Found ID issues:');
                console.table(idIssues);
                console.log('Fixing IDs...');
                for (const issue of idIssues) {
                    await AirtimePlan.findByIdAndUpdate(issue.id, { providerId: issue.expectedId });
                }
                console.log('Finished fixing IDs.');
            }
            else {
                console.log('No issues found either way.');
            }
        }
        await mongoose.disconnect();
    }
    catch (err) {
        console.error(err);
        process.exit(1);
    }
}
checkPlans();
