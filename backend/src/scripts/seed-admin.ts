// scripts/seed-admin.ts
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { config } from '../config/bootstrap.js';
import { AdminRole, AdminUser } from '../models/index.js';

async function seedAdmin() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(config.mongoUri);
    console.log('✅ Connected to MongoDB');

    // Check if admin role exists, if not create it
    let adminRole = await AdminRole.findOne({ name: 'Super Admin' });
    
    if (!adminRole) {
      console.log('📝 Creating Super Admin role...');
      adminRole = await AdminRole.create({
        name: 'Super Admin',
        description: 'Full system access',
        permissions: ['*'], // Wildcard for all permissions
        status: 'active'
      });
      console.log('✅ Super Admin role created');
    } else {
      console.log('✅ Super Admin role already exists');
    }

    // Check if admin user exists
    const existingAdmin = await AdminUser.findOne({ email: 'admin@vtuapp.com' });
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists');
      console.log('📧 Email: admin@vtuapp.com');
      console.log('🔑 If you forgot the password, delete the admin and run this script again');
      
      // Update password anyway
      const password = 'Admin@123456';
      const password_hash = await bcrypt.hash(password, 10);
      
      existingAdmin.password_hash = password_hash;
      existingAdmin.role_id = adminRole._id;
      existingAdmin.updated_at = new Date();
      await existingAdmin.save();
      
      console.log('\n✅ Admin password reset successfully!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📧 Email: admin@vtuapp.com');
      console.log('🔑 Password: Admin@123456');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    } else {
      console.log('📝 Creating admin user...');
      
      // Create admin user
      const password = 'Admin@123456';
      const password_hash = await bcrypt.hash(password, 10);
      
      const admin = await AdminUser.create({
        email: 'admin@vtuapp.com',
        password_hash,
        first_name: 'Super',
        last_name: 'Admin',
        role_id: adminRole._id,
        status: 'active'
      });
      
      console.log('\n✅ Admin user created successfully!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📧 Email: admin@vtuapp.com');
      console.log('🔑 Password: Admin@123456');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('⚠️  IMPORTANT: Change this password after first login!');
    }

    await mongoose.disconnect();
    console.log('\n✅ Done! MongoDB disconnected');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin:', error);
    process.exit(1);
  }
}

seedAdmin();
