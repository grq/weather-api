import { Request, Response, NextFunction } from 'express'

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
    console.error(`API ERROR : ${code} : ${message}\n`, err)
    res.status(code).send(message)
}
