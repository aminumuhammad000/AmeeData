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

        const email = 'admin@connectavtu.com';
        const password = 'Admin@123456';
        const password_hash = await bcrypt.hash(password, 10);

        await AdminUser.findOneAndUpdate(
            { email },
            {
                email,
                password_hash,
                first_name: 'Super',
                last_name: 'Admin',
                role_id: adminRole._id,
                status: 'active',
                updated_at: new Date()
            },
            { upsert: true, new: true }
        );

        console.log('\n✅ Admin user created/updated successfully!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`📧 Email: ${email}`);
        console.log(`🔑 Password: ${password}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating admin:', error);
        process.exit(1);
    }
}

createNewAdmin();
