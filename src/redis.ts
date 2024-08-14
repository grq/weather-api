import { createClient, RedisClientType } from 'redis'
import dotenv from 'dotenv'

dotenv.config()

export const RedisKey = {
    UserWeatherRequests: (id: number) => `user-weather-requests:${id}`,
    UserLimitExceeded: (id: number) => `limit-exceeded:${id}`,
    UserEndpointRateCount: (id: number, endpoint: string, time: string) => `rate-limit:${id}:${endpoint}:${time}`
}

const redisHost = process.env.REDIS_HOST
const redisPort = process.env.REDIS_PORT

if (!redisHost || !redisPort) {
    throw new Error('Cannot initialize redis: missing required environment variables')
}

const redisClient: RedisClientType = createClient({
    url: `redis://${redisHost}:${redisPort}`
})

redisClient.on('error', e => {
    // console.error('Redis Client Error', e)
})

redisClient.connect()
    .then(() => console.log('Connected to Redis'))
    .catch(e => {
        // console.error('Failed to connect to Redis:', e)
    })

export default redisClient
