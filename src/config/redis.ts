import Redis from 'ioredis';

const redisHost = process.env.REDIS_HOST || '127.0.0.1';
const redisPort = parseInt(process.env.REDIS_PORT || '6379');
const redisPassword = process.env.REDIS_PASSWORD;

const redis = new Redis({
    host: redisHost,
    port: redisPort,
    password: redisPassword,
    retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
});

redis.on('connect', () => {
    console.log('✅ Connected to Redis successfully');
});

redis.on('error', (err) => {
    console.error('❌ Redis Connection Error:', err);
});

/**
 * Set OTP in Redis with an expiration
 * @param email - User's email as key
 * @param otp - 6-digit verification code
 * @param expiryInSeconds - Time to live (default 10 mins)
 */
export const setOTP = async (email: string, otp: string, expiryInSeconds: number = 600) => {
    await redis.set(`otp:${email.toLowerCase()}`, otp, 'EX', expiryInSeconds);
};

/**
 * Get OTP from Redis
 * @param email - User's email
 */
export const getOTP = async (email: string): Promise<string | null> => {
    return await redis.get(`otp:${email.toLowerCase()}`);
};

/**
 * Delete OTP from Redis
 * @param email - User's email
 */
export const deleteOTP = async (email: string) => {
    await redis.del(`otp:${email.toLowerCase()}`);
};

export default redis;
