import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGO_URI = 'mongodb+srv://aminumuhammadhadejia:Robot%40net.1-5@cluster0.pxxixvd.mongodb.net/connecta_vtu?appName=Cluster0';

async function testLogin() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to Atlas');

        const db = mongoose.connection.db;
        const user = await db.collection('admin_users').findOne({ email: 'admin@ameedata.com.ng' });

        if (!user) {
            console.log('User NOT found in cloud DB');
        } else {
            console.log('User found:', user.email);
            const isMatch = await bcrypt.compare('AmeeData@2026', user.password_hash);
            console.log('Password match:', isMatch);
        }

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

testLogin();
