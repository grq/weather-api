import express, { Request, Response } from 'express'
import jwt from 'jwt-simple'
import { sendToLimitExceededQueue } from './rabbitmq'
import redisClient, { RedisKey } from './redis'
import { getUser, getWeather } from './db'
import { authenticate, limiter } from './middleware'
import dotenv from 'dotenv'
import { IReqUser } from './types'

dotenv.config()

const router = express.Router()
const cacheTtl = Number(process.env.CACHE_TTL)
const weatherTotalLimit = Number(process.env.WEATHER_TOTAL_LIMIT)
const weatherLimitTimespan = Number(process.env.WEATHER_LIMIT_TIMESPAN)
const weatherLimitTimespanCalls = Number(process.env.WEATHER_LIMIT_TIMESPAN_CALLS)

if (isNaN(weatherTotalLimit) || isNaN(weatherLimitTimespan) || isNaN(weatherLimitTimespanCalls)) {
    throw new Error('Cannot initialize router: missing required environment variables')
}

router.post('/auth/login', async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body
        const user = await getUser(username, password)
        if (user) {
            const token = jwt.encode({
                username: user.username,
                userId: user.id
            }, process.env.JWT_SECRET as string)
            res.json({ accessToken: token })
        } else {
            return res.status(401).send('Invalid credentials')
        }
    } catch (e) {
        return res.status(500).send('Internal server error')
    }
})

router.get('/weather', authenticate, limiter('weather', weatherLimitTimespan, weatherLimitTimespanCalls), async (req: IReqUser, res: Response) => {
    const { city, date } = req.query

    if (!city || !date) {
        return res.status(400).send('City and date are required')
    }

    const cacheKey = `weather-${city}-${date}`
    const userId = req.user?.userId as number

    try {
        const totalRequestCount = await redisClient.incr(RedisKey.UserWeatherRequests(userId))

        if (totalRequestCount > weatherTotalLimit) {
            const limitExceededKey = RedisKey.UserLimitExceeded(userId)
            const alreadySent = await redisClient.get(limitExceededKey)
            if (!alreadySent) {
                await sendToLimitExceededQueue({ userId })
                await redisClient.set(limitExceededKey, 'true')
                console.log('User request limit exceeded')
            }
            return res.status(403).send('User request limit exceeded')
        }

        const cachedData = await redisClient.get(cacheKey)
        if (cachedData) {
            return res.json(JSON.parse(cachedData))
        }

        const weatherData = await getWeather(city as string, date as string)
        if (!weatherData) {
            return res.status(404).send('Weather data not found')
        }

        await redisClient.setEx(cacheKey, cacheTtl, JSON.stringify(weatherData))

        res.json(weatherData)

    } catch (err) {
        console.error('Error fetching weather data:', err)
        return res.status(500).send('Internal server error')
    }
})

router.get('/limitget', authenticate, async (req: IReqUser, res: Response) => {
    const count = await redisClient.get(RedisKey.UserWeatherRequests(req.user?.userId as number))
    res.json({ limit: count ? Number(count) : 0 })
})

router.get('/limitreset', authenticate, async (req: IReqUser, res: Response) => {
    const userId = req.user?.userId as number
    await redisClient.del(RedisKey.UserLimitExceeded(userId))
    await redisClient.del(RedisKey.UserWeatherRequests(userId))
    res.json({ limit: 0 })
})

export default router
