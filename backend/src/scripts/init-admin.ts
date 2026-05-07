#!/usr/bin/env node

/**
 * Production Admin Initialization Script
 * 
 * This script should be run during deployment/setup to ensure an admin user exists.
 * If no admin exists, it creates one with a secure random password.
 * 
 * Usage:
 *   npm run init:admin
 *   OR
 *   npx tsx src/scripts/init-admin.ts
 * 
 * Output: Displays admin credentials (save these in a secure location!)
 */

import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { config } from '../config/bootstrap.js';
import { AdminRole, AdminUser } from '../models/index.js';

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(color: string, message: string) {
  console.log(`${color}${message}${colors.reset}`);
}

function generateSecurePassword(): string {
  // Generate a secure random password with uppercase, lowercase, numbers, and special chars
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%^&*';
  
  const allChars = uppercase + lowercase + numbers + special;
  
  let password = '';
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];
  
  // Fill the rest with random characters
  for (let i = password.length; i < 12; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

async function initializeAdmin() {
  try {
    log(colors.cyan, '╔════════════════════════════════════════════════════════════╗');
    log(colors.cyan, '║        VTU APP - ADMIN INITIALIZATION SCRIPT                 ║');
    log(colors.cyan, '║              Production Ready Setup                          ║');
    log(colors.cyan, '╚════════════════════════════════════════════════════════════╝\n');

    // Step 1: Connect to MongoDB
    log(colors.blue, '📡 Step 1: Connecting to MongoDB...');
    console.log(`   URI: ${config.mongoUri}`);
    
    await mongoose.connect(config.mongoUri);
    log(colors.green, '   ✅ Connected successfully\n');

    // Step 2: Check/Create Admin Role
    log(colors.blue, '📡 Step 2: Checking admin role...');
    
    let adminRole = await AdminRole.findOne({ name: 'Super Admin' });
    
    if (!adminRole) {
      log(colors.yellow, '   ⚠️  Super Admin role not found, creating...');
      adminRole = await AdminRole.create({
        name: 'Super Admin',
        description: 'Full system access - All permissions granted',
        permissions: ['*'], // Wildcard for all permissions
        status: 'active'
      });
      log(colors.green, '   ✅ Super Admin role created\n');
    } else {
      log(colors.green, '   ✅ Super Admin role already exists\n');
    }

    // Step 3: Check for existing admin
    log(colors.blue, '📡 Step 3: Checking for existing admin user...');
    
    const existingAdmin = await AdminUser.findOne({}).sort({ created_at: -1 });
    
    if (existingAdmin && existingAdmin.status === 'active') {
      log(colors.yellow, '   ⚠️  Active admin user already exists\n');
      log(colors.bright + colors.yellow, '   EXISTING ADMIN DETAILS:');
      log(colors.yellow, `   📧 Email: ${existingAdmin.email}`);
      log(colors.yellow, `   👤 Name: ${existingAdmin.first_name} ${existingAdmin.last_name}`);
      log(colors.yellow, `   ⏰ Created: ${existingAdmin.created_at.toLocaleString()}`);
      log(colors.yellow, `   🔄 Last Login: ${existingAdmin.last_login_at ? existingAdmin.last_login_at.toLocaleString() : 'Never'}\n`);
      
      log(colors.bright + colors.green, '   ✅ No action needed - Admin already configured\n');
    } else {
      // Step 4: Create new admin with secure password
      log(colors.yellow, '   ⚠️  No active admin user found\n');
      log(colors.blue, '📡 Step 4: Creating new admin user with secure password...\n');
      
      const adminEmail = 'admin@vtuapp.com';
      const adminPassword = generateSecurePassword();
      const adminName = process.env.ADMIN_NAME || 'Admin';
      const [firstName, ...lastNameParts] = adminName.split(' ');
      const lastName = lastNameParts.join(' ') || 'User';
      
      // Hash the password with proper bcrypt rounds
      const password_hash = await bcrypt.hash(adminPassword, 10);
      
      const newAdmin = await AdminUser.create({
        email: adminEmail,
        password_hash,
        first_name: firstName,
        last_name: lastName,
        role_id: adminRole._id,
        status: 'active'
      });
      
      log(colors.bright + colors.green, '   ✅ NEW ADMIN USER CREATED SUCCESSFULLY!\n');
      
      // Display credentials in a prominent way
      log(colors.bright + colors.green, '╔════════════════════════════════════════════════════════════╗');
      log(colors.bright + colors.green, '║              🔐 ADMIN CREDENTIALS - SAVE SECURELY! 🔐       ║');
      log(colors.bright + colors.green, '╠════════════════════════════════════════════════════════════╣');
      log(colors.bright + colors.green, `║ 📧 EMAIL:                ${adminEmail.padEnd(37)}║`);
      log(colors.bright + colors.green, `║ 🔑 PASSWORD:             ${adminPassword.padEnd(35)}║`);
      log(colors.bright + colors.green, '╠════════════════════════════════════════════════════════════╣');
      log(colors.bright + colors.green, `║ 👤 NAME:                 ${(`${newAdmin.first_name} ${newAdmin.last_name}`).padEnd(37)}║`);
      log(colors.bright + colors.green, `║ 🛡️  ROLE:                 Super Admin${' '.repeat(27)}║`);
      log(colors.bright + colors.green, `║ ✅ STATUS:                Active${' '.repeat(34)}║`);
      log(colors.bright + colors.green, '╚════════════════════════════════════════════════════════════╝\n');
      
      log(colors.bright + colors.yellow, '⚠️  IMPORTANT SECURITY NOTES:');
      log(colors.yellow, '   1. Save these credentials in a SECURE location (password manager)');
      log(colors.yellow, '   2. Change the password after your first login');
      log(colors.yellow, '   3. Do NOT commit these credentials to version control');
      log(colors.yellow, '   4. Do NOT share these credentials publicly\n');
    }

    // Step 5: Database Summary
    log(colors.blue, '📡 Step 5: Database Summary...');
    const adminCount = await AdminUser.countDocuments();
    const adminRoleCount = await AdminRole.countDocuments();
    log(colors.green, `   ✅ Total Admin Users: ${adminCount}`);
    log(colors.green, `   ✅ Total Admin Roles: ${adminRoleCount}\n`);

    // Final summary
    log(colors.bright + colors.green, '╔════════════════════════════════════════════════════════════╗');
    log(colors.bright + colors.green, '║              ✅ INITIALIZATION COMPLETE ✅                  ║');
    log(colors.bright + colors.green, '╚════════════════════════════════════════════════════════════╝\n');

    log(colors.cyan, '🚀 Next Steps:');
    log(colors.cyan, '   1. Login at: http://your-app-url/login');
    log(colors.cyan, '   2. Use the credentials above');
    log(colors.cyan, '   3. Change your password after first login');
    log(colors.cyan, '   4. Create additional admin users through the dashboard\n');

    await mongoose.disconnect();
    log(colors.green, '✅ MongoDB disconnected - Setup complete!\n');
    
    process.exit(0);
  } catch (error: any) {
    log(colors.red, '\n❌ ERROR DURING INITIALIZATION\n');
    log(colors.red, `Error: ${error.message}`);
    
    if (error.message.includes('ECONNREFUSED')) {
      log(colors.red, '\n💡 Hint: MongoDB might not be running');
      log(colors.red, '   Make sure MongoDB is started and accessible at:');
      log(colors.red, `   ${config.mongoUri}`);
    }
    
    console.error('\nFull error details:', error);
    process.exit(1);
  }
}

// Run the initialization
initializeAdmin();
