import mongoose from 'mongoose';
import { User } from './src/models/user.model';
import { Wallet } from './src/models/wallet.model';
import { CareCircleMember } from './src/models/care_circle.model';

const MONGO_URI = "mongodb://localhost:27017/ameedata";

async function seed() {
    try {
        await mongoose.connect(MONGO_URI);
        const user = await User.findOne({ email: 'ameedata2026@gmail.com' });
        if (!user) {
            console.log('User ameedata2026@gmail.com not found. Please register it first.');
            process.exit(1);
        }

        // 1. Set balance
        await Wallet.findOneAndUpdate(
            { user_id: user._id },
            { balance: 75000 },
            { upsert: true }
        );
        console.log('Set balance for ameedata2026@gmail.com to 75,000');

        // 2. Add some favorites from other users
        const others = await User.find({ _id: { : user._id } }).limit(2);
        if (others.length > 0) {
            await CareCircleMember.deleteMany({ user_id: user._id });
            const favorites = others.map((o, idx) => ({
                user_id: user._id,
                member_id: o._id,
                nickname: idx === 0 ? 'Mama ❤️' : 'Chinedu',
                relationship_label: idx === 0 ? 'Mom' : 'Brother',
                is_pinned: true,
                quick_amounts: [500, 1000, 2000]
            }));
            await CareCircleMember.create(favorites);
            console.log('Added favorites to Care Circle');
        }

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
seed();
