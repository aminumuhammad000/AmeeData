import axios from 'axios';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import { User, VirtualAccount } from '../models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../', '.env') });

const testWebhook = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/connecta_vtu');
        const user = await User.findOne({ email: 'aminuamee2025@gmail.com' });
        if (!user) {
            console.error('User not found');
            process.exit(1);
        }

        const account = await VirtualAccount.findOne({ user: user._id, provider: 'vtstack' });
        if (!account) {
            console.error('Virtual account not found for user');
            process.exit(1);
        }

        const accountNumber = account.accountNumber;
        console.log(`Found virtual account number: ${accountNumber}`);

        const payload = {
            event: 'payment.success',
            data: {
                accountNumber: accountNumber,
                amount: '10000',
                reference: `test-webhook-${Date.now()}`,
                customer: 'Test Local User'
            }
        };

        console.log(`Sending webhook request to local backend... payload:`, payload);
        try {
            const response = await axios.post(`http://localhost:${process.env.PORT || 5000}/api/payment/webhook/vtstack`, payload);
            console.log('Webhook Response:', response.status, response.data);
            console.log('Successfully completed test webhook! Check server logs to see the wallet update.');
        } catch (e: any) {
            console.error('Failed pushing webhook to local backend (Make sure server is running!):', e.response?.data || e.message);
        }
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

testWebhook();
