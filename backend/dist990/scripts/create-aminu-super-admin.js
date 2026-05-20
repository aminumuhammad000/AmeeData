import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { config } from '../config/bootstrap.js';
import { AdminRole, AdminUser } from '../models/index.js';
async function createNewAdmin() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(config.mongoUri);
        console.log('✅ Connected to MongoDB');
        let adminRole = await AdminRole.findOne({ name: 'Super Admin' });
        if (!adminRole) {
            adminRole = await AdminRole.create({
                name: 'Super Admin',
                description: 'Full system access',
                permissions: ['*'],
                status: 'active'
            });
        }
        const email = 'aminuamee@yahoo.com';
        const password = 'Robot@net.1-5';
        const password_hash = await bcrypt.hash(password, 10);
        await AdminUser.findOneAndUpdate({ email }, {
            email,
            password_hash,
            first_name: 'Aminu',
            last_name: 'Amee',
            role_id: adminRole._id,
            type: 'super-admin', // Explicitly setting the type
            status: 'active',
            updated_at: new Date()
        }, { upsert: true, new: true });
        console.log('\n✅ Super-Admin user created/updated successfully!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`📧 Email: ${email}`);
        console.log(`🔑 Password: ${password}`);
        console.log(`✨ Type: super-admin`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        await mongoose.disconnect();
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Error creating admin:', error);
        process.exit(1);
    }
}
createNewAdmin();
