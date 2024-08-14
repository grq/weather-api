import { Request, Response, NextFunction } from 'express'
import logger from './logger'

export class AppError extends Error {
    statusCode: number
    isOperational: boolean

    constructor(message: string, statusCode: number, isOperational = true) {
        super(message)
        this.statusCode = statusCode
        this.isOperational = isOperational

        Error.captureStackTrace(this, this.constructor)
    }
}

export const errorHandler = (err: AppError, req: Request, res: Response, next: NextFunction) => {
    const code = err.statusCode || 500
    const message = err.message || 'Internal Server Error'
    logger.error(`StatusCode: ${code}, Message: ${message}, Stack: ${err.stack}`)
    res.status(code).send(message)
}
