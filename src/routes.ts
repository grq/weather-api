import express, { NextFunction, Request, Response } from 'express'
import jwt from 'jwt-simple'
import { sendToLimitExceededQueue } from './rabbitmq'
import redisClient, { RedisKey } from './redis'
import { getUser, getWeather } from './db'
import { authenticate, rateLimiter } from './middleware'
import dotenv from 'dotenv'
import { IReqUser } from './types'
import { AppError } from './error-handler'

dotenv.config()

const apiRouter = express.Router()
const cacheTtl = Number(process.env.CACHE_TTL)
const weatherTotalLimit = Number(process.env.WEATHER_TOTAL_LIMIT)
const weatherLimitTimespan = Number(process.env.WEATHER_LIMIT_TIMESPAN)
const weatherLimitTimespanCalls = Number(process.env.WEATHER_LIMIT_TIMESPAN_CALLS)

if (isNaN(weatherTotalLimit) || isNaN(weatherLimitTimespan) || isNaN(weatherLimitTimespanCalls)) {
    throw new Error('Cannot initialize router: missing required environment variables')
}

export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) =>
    Promise<any>) => (req: Request, res: Response, next: NextFunction) => fn(req, res, next).catch(next)

apiRouter.post(
    '/auth/login',
    asyncHandler(async (req: Request, res: Response) => {
        const { username, password } = req.body
        const user = await getUser(username, password)
        if (user) {
            const token = jwt.encode({
                username: user.username,
                userId: user.id
            }, process.env.JWT_SECRET as string)
            res.json({ accessToken: token })
        } else {
            throw new AppError('Invalid credentials', 401)
        }
    })
)

apiRouter.get(
    '/weather',
    authenticate,
    rateLimiter('weather', weatherLimitTimespan, weatherLimitTimespanCalls),
    asyncHandler(async (req: IReqUser, res: Response) => {
        const { city, date } = req.query

        if (!city || !date) {
            throw new AppError('City and date are required', 400)
        }

        const cacheKey = `weather-${city}-${date}`
        const userId = req.user?.userId as number

        const totalRequestCount = await redisClient.incr(RedisKey.UserWeatherRequests(userId))

        if (totalRequestCount > weatherTotalLimit) {
            const limitExceededKey = RedisKey.UserLimitExceeded(userId)
            const alreadySent = await redisClient.get(limitExceededKey)
            if (!alreadySent) {
                await sendToLimitExceededQueue({ userId })
                await redisClient.set(limitExceededKey, 'true')
                console.log('User request limit exceeded')
            }
            throw new AppError('User request limit exceeded', 403)
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
    })
)

apiRouter.get(
    '/limitget',
    authenticate,
    asyncHandler(async (req: IReqUser, res: Response) => {
        const count = await redisClient.get(RedisKey.UserWeatherRequests(req.user?.userId as number))
        res.json({ limit: count ? Number(count) : 0 })
    })
)

apiRouter.get(
    '/limitreset',
    authenticate,
    asyncHandler(async (req: IReqUser, res: Response, next: NextFunction) => {
        const userId = req.user?.userId as number
        await redisClient.del(RedisKey.UserLimitExceeded(userId))
        await redisClient.del(RedisKey.UserWeatherRequests(userId))
        res.json({ limit: 0 })
    })
)

export default apiRouter
