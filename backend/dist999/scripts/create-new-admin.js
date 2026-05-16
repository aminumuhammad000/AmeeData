import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { config } from '../config/bootstrap.js';
import { AdminRole, AdminUser } from '../models/index.js';
const ADMIN_EMAIL = 'admin@ameedata.com.ng';
const ADMIN_PASSWORD = 'Admin@123456';
async function createNewAdmin() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(config.mongoUri);
        console.log('✅ Connected to MongoDB');
        // Ensure Super Admin role exists
        let adminRole = await AdminRole.findOne({ name: 'Super Admin' });
        if (!adminRole) {
            adminRole = await AdminRole.create({
                name: 'Super Admin',
                description: 'Full system access',
                permissions: ['*'],
                status: 'active'
            });
        }
        const password_hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
        await AdminUser.findOneAndUpdate({ email: ADMIN_EMAIL }, {
            email: ADMIN_EMAIL,
            password_hash,
            first_name: 'Super',
            last_name: 'Admin',
            role_id: adminRole._id,
            type: 'super-admin', // ✅ Full access
            status: 'active',
            updated_at: new Date()
        }, { upsert: true, new: true });
        console.log('\n✅ Super Admin created/updated successfully!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`📧 Email:    ${ADMIN_EMAIL}`);
        console.log(`🔑 Password: ${ADMIN_PASSWORD}`);
        console.log('👑 Type:     super-admin (full access)');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('⚠️  IMPORTANT: Change this password after first login!');
        await mongoose.disconnect();
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Error creating admin:', error);
        process.exit(1);
    }
}
createNewAdmin();
