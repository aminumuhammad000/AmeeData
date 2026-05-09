#!/usr/bin/env tsx
// scripts/create-admin.ts
// Script to create an admin user for the VTU App

import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

// Configure __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Admin Role Schema
const adminRoleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

const AdminRole = mongoose.model('AdminRole', adminRoleSchema, 'admin_roles');

// Admin User Schema
const adminUserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  role_id: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminRole', required: true },
  last_login_at: { type: Date },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

const AdminUser = mongoose.model('AdminUser', adminUserSchema, 'admin_users');

async function createAdmin() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    const mongoUri = process.env.MONGO_URI || 'mongodb://0.0.0.0/connecta_vtu';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
    console.log('📍 Host:', mongoose.connection.host);
    console.log('📁 Database:', mongoose.connection.name);

    // Step 1: Create or get Super Admin role
    console.log('\n🎭 Setting up admin role...');
    let superAdminRole = await AdminRole.findOne({ name: 'super_admin' });

    if (!superAdminRole) {
      superAdminRole = await AdminRole.create({
        name: 'super_admin',
        description: 'Super Administrator with full system access',
        created_at: new Date(),
        updated_at: new Date()
      });
      console.log('✅ Super Admin role created');
    } else {
      console.log('✅ Super Admin role found');
    }

    // Step 2: Check if admin already exists
    const targetEmail = 'admin@ameedata.com.ng';
    const existingAdmin = await AdminUser.findOne({ email: targetEmail });
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists! Updating password...');
      const password = 'AmeeData@2026';
      const password_hash = await bcrypt.hash(password, 10);
      await AdminUser.updateOne(
        { email: targetEmail },
        { 
          password_hash,
          role_id: superAdminRole!._id,
          updated_at: new Date()
        }
      );
      console.log('✅ Admin password updated successfully!');
      console.log('📧 Email:', targetEmail);
      console.log('🔑 Password: AmeeData@2026');
      await mongoose.disconnect();
      process.exit(0);
    } else {
      console.log('\n🔐 Creating admin user...');

      // Hash the password
      const password = 'AmeeData@2026';
      const password_hash = await bcrypt.hash(password, 10);

      // Create admin user with role_id
      const admin = await AdminUser.create({
        email: targetEmail,
        password_hash,
        first_name: 'Amee',
        last_name: 'Admin',
        role_id: superAdminRole._id,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      });

      console.log('\n✅ Admin user created successfully!');
      console.log('═══════════════════════════════════════');
      console.log('📧 Email:', targetEmail);
      console.log('🔑 Password: AmeeData@2026');
      console.log('👤 Name: Amee Admin');
      console.log('🎭 Role: super_admin');
      console.log('📅 Created:', new Date().toLocaleString());
      console.log('═══════════════════════════════════════');
      console.log('\n⚠️  IMPORTANT: Change the password after first login!');
      console.log('\n🚀 You can now login at: POST https://api.ameedata.com.ng/api/admin/login');

      await mongoose.disconnect();
      process.exit(0);
    }
  } catch (error: any) {
    console.error('❌ Error creating admin user:', error.message);
    if (error.code === 11000) {
      console.error('⚠️  Admin user with this email already exists');
    }
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run the script
console.log('═══════════════════════════════════════');
console.log('   VTU App - Admin User Creation');
console.log('═══════════════════════════════════════\n');
createAdmin();
