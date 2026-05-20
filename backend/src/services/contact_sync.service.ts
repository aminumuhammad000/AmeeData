import { User, CareCircleMember } from '../models/index.js';
import redis from '../config/redis.js';
import { Types } from 'mongoose';

export class ContactSyncService {
  private static CACHE_TTL = 3600 * 24; // 24 hours

  /**
   * Sync contacts and update Care Circle
   */
  static async sync(userId: string, phoneNumbers: string[]) {
    // 1. Normalize numbers
    const cleanNumbers = phoneNumbers.map(p => p.replace(/\D/g, ''));
    
    // 2. Try to get matches from cache first for performance
    const cachedMatches = await this.getCachedMatches(cleanNumbers);
    
    // 3. Find missing numbers from DB
    const missingNumbers = cleanNumbers.filter(n => !cachedMatches.has(n));
    let dbMatches: any[] = [];
    
    if (missingNumbers.length > 0) {
      dbMatches = await User.find({
        $or: [
          { phone_number: { $in: missingNumbers } },
          { phone_number: { $regex: missingNumbers.map(n => n + '$').join('|') } }
        ]
      }).select('_id phone_number first_name last_name profile_picture');
      
      // Update cache with new matches
      await this.cacheMatches(dbMatches);
    }

    // Combine results
    const allMatches = [...Array.from(cachedMatches.values()), ...dbMatches.map(u => ({
      id: u._id,
      phone_number: u.phone_number,
      first_name: u.first_name,
      last_name: u.last_name,
      profile_picture: u.profile_picture
    }))];

    // 4. Automatically add to Care Circle
    if (userId && allMatches.length > 0) {
      const circleOps = allMatches
        .filter(u => u.id.toString() !== userId)
        .map(u => ({
          updateOne: {
            filter: { user_id: userId, member_id: u.id },
            update: { $setOnInsert: { user_id: userId, member_id: u.id, created_at: new Date() } },
            upsert: true
          }
        }));

      if (circleOps.length > 0) {
        await CareCircleMember.bulkWrite(circleOps);
      }
    }

    return allMatches.map(u => ({ ...u, in_circle: true }));
  }

  private static async getCachedMatches(numbers: string[]): Promise<Map<string, any>> {
    const matches = new Map<string, any>();
    if (numbers.length === 0) return matches;

    const pipeline = redis.pipeline();
    numbers.forEach(num => pipeline.get(`user:phone:${num}`));
    
    const results = await pipeline.exec();
    
    results?.forEach((res, index) => {
      if (res[1]) {
        try {
          const userData = JSON.parse(res[1] as string);
          matches.set(numbers[index], userData);
        } catch (e) {
          // Ignore parse errors
        }
      }
    });

    return matches;
  }

  private static async cacheMatches(users: any[]) {
    const pipeline = redis.pipeline();
    users.forEach(u => {
      const userData = JSON.stringify({
        id: u._id,
        phone_number: u.phone_number,
        first_name: u.first_name,
        last_name: u.last_name,
        profile_picture: u.profile_picture
      });
      pipeline.setex(`user:phone:${u.phone_number}`, this.CACHE_TTL, userData);
      
      // Also cache variations if needed (e.g. without +)
      const clean = u.phone_number.replace(/\D/g, '');
      if (clean !== u.phone_number) {
        pipeline.setex(`user:phone:${clean}`, this.CACHE_TTL, userData);
      }
    });
    await pipeline.exec();
  }
}
