import { Redis } from 'ioredis';
const redisConfig = {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
    retryStrategy: (times) => {
        return Math.min(times * 50, 2000);
    }
};
export const redis = new Redis(redisConfig);
redis.on('error', (err) => {
    console.error('Redis error:', err);
});
redis.on('connect', () => {
    console.log('Redis connected successfully');
});
export default redis;
