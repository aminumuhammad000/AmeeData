import mongoose from 'mongoose';
import { config } from '../config/bootstrap.js';
import { AdminUser } from '../models/index.js';
async function listAdmins() {
    try {
        await mongoose.connect(config.mongoUri);
        const admins = await AdminUser.find({}, 'email first_name last_name status');
        console.log('--- Admin Users ---');
        admins.forEach(admin => {
            console.log(`Email: ${admin.email}, Name: ${admin.first_name} ${admin.last_name}, Status: ${admin.status}`);
        });
        console.log('-------------------');
        await mongoose.disconnect();
        process.exit(0);
    }
    catch (error) {
        console.error('Error listing admins:', error);
        process.exit(1);
    }
}
listAdmins();
