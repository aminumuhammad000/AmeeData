import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGO_URI = 'mongodb+srv://aminumuhammadhadejia:Robot%40net.1-5@cluster0.pxxixvd.mongodb.net/?appName=Cluster0';

async function checkCloudDB() {
    try {
        console.log('Connecting to cloud DB...');
        await mongoose.connect(MONGO_URI);
        console.log('Connected!');

        const db = mongoose.connection.db;
        if (!db) throw new Error('DB not found');
        const admins = await db.collection('admin_users').find({}).toArray();

        console.log('--- Cloud Admin Users ---');
        admins.forEach(admin => {
            console.log(`Email: ${admin.email}, Name: ${admin.first_name} ${admin.last_name}, Status: ${admin.status}`);
        });
        console.log('-------------------------');

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkCloudDB();
