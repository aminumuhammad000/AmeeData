
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { User } from './models/user.model.js';

dotenv.config();

const getToken = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/connecta_vtu');

        const user = await User.findOne({});
        if (user) {
            const token = jwt.sign({ id: user._id, role: (user as any).role || 'user' }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
            console.log('TOKEN:', token);
            console.log('USER_ID:', user._id);
            console.log('PIN:', user.transaction_pin);
        } else {
            console.log('No user found');
        }
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

getToken();
