import mongoose from 'mongoose';
import vtpassService from './src/services/vtpass.service.js';
import dotenv from 'dotenv';

dotenv.config();

async function check() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/connecta_vtu');
        const vtBalance = await vtpassService.getWalletBalance();
        console.log('VT_BALANCE:' + vtBalance.balance);
        process.exit(0);
    } catch (e: any) {
        console.log('VT_ERROR:' + e.message);
        process.exit(1);
    }
}
check();
