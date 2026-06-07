import mongoose from 'mongoose';
import { config } from '../config/bootstrap.js';
import { AdminRole } from '../models/index.js';
async function seedRoles() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(config.mongoUri);
        console.log('✅ Connected to MongoDB');
        const roles = [
            {
                name: 'Super Admin',
                description: 'Full system access',
                permissions: ['*'],
                status: 'active'
            },
            {
                name: 'API Manager',
                description: 'Access to API Management and Notifications only',
                permissions: ['api_management', 'notifications'],
                status: 'active'
            }
        ];
        for (const role of roles) {
            await AdminRole.findOneAndUpdate({ name: role.name }, role, { upsert: true, new: true });
            console.log(`✅ Role seeded: ${role.name}`);
        }
        console.log('\n✅ Roles seeded successfully!');
        await mongoose.disconnect();
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Error seeding roles:', error);
        process.exit(1);
    }
}
seedRoles();
