import { Response, NextFunction } from 'express'
import jwt from 'jwt-simple'
import redisClient, { RedisKey } from './redis'
import { IReqUser } from './types'
import dotenv from 'dotenv'

dotenv.config()

export const authenticate = (req: IReqUser, res: Response, next: NextFunction) => {
    const token = req.headers['authorization']?.split(' ')[1]
    if (token) {
        try {
            req.user = jwt.decode(token, process.env.JWT_SECRET as string)
            next()
        } catch (err) {
            res.status(401).send('Invalid token')
        }
    } else {
        return res.status(401).send('Unauthorized')
    }
}

export const limiter = (endpoint: string, msTimeout: number, limit: number) => {
    return async (req: IReqUser, res: Response, next: NextFunction) => {
        const userId = req.user?.userId
        if (userId) {
            const currentTime = Math.floor(Date.now() / 1000).toString()
            const key = RedisKey.UserEndpointRateCount(userId, endpoint, currentTime)
            try {
                const currentCount = await redisClient.get(key)
                if (currentCount && Number(currentCount) >= limit) {
                    return res.status(429).send('Too many requests')
                }
                await redisClient.multi().incr(key).expire(key, msTimeout / 1000).exec()
                next()
            } catch (err) {
                console.error('Error in rate limiter:', err)
                res.status(500).send('Internal server error')
            }
        } else {
            return next()
        }
    }
}
