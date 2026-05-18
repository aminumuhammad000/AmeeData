import mongoose from 'mongoose';
import topupmateService from './src/services/topupmate.service';
import smeplugService from './src/services/smeplug.service';
import dotenv from 'dotenv';

dotenv.config();

async function check() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/connecta_vtu');
        console.log('--- Provider Balances ---');
        
        try {
            const tmBalance = await topupmateService.getWalletBalance();
            console.log('TopupMate Balance:', tmBalance.balance);
            console.log('TopupMate Info:', tmBalance.name, tmBalance.status);
            console.log('TopupMate Raw:', JSON.stringify(tmBalance.raw));
        } catch (e: any) {
            console.log('TopupMate Balance Check Failed:', e.message);
        }

        try {
            const smeBalance = await smeplugService.getWalletBalance();
            console.log('SMEPlug Balance:', smeBalance.balance);
        } catch (e: any) {
            console.log('SMEPlug Balance Check Failed:', e.message);
        }

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
check();
