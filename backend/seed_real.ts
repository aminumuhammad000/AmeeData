import mongoose from 'mongoose';
import { User } from './src/models/user.model';
import { Wallet } from './src/models/wallet.model';
import { CareCircleMember } from './src/models/care_circle.model';

const MONGO_URI = "mongodb://127.0.0.1:27017/connecta_vtu";

async function seed() {
    try {
        await mongoose.connect(MONGO_URI);
        const user = await User.findOne({ email: 'ameedata2026@gmail.com' });
        if (!user) {
            console.log('User not found');
            process.exit(1);
        }

        // 1. Set balance
        await Wallet.findOneAndUpdate(
            { user_id: user._id },
            { balance: 75000 },
            { upsert: true }
        );
        console.log('Set balance for ' + user.email + ' to 75,000');

        // 2. Add some favorites
        const others = await User.find({ _id: { : user._id } }).limit(2);
        if (others.length > 0) {
            await CareCircleMember.deleteMany({ user_id: user._id });
            const favorites = others.map((o: any, idx: number) => ({
                user_id: user._id,
                member_id: o._id,
                nickname: idx === 0 ? 'Mama ❤️' : 'Chinedu',
                relationship_label: idx === 0 ? 'Mom' : 'Brother',
                is_pinned: true,
                quick_amounts: [500, 1000, 5000]
            }));
            await CareCircleMember.create(favorites);
            console.log('Added Mama and Chinedu to Care Circle');
        }

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
seed();
