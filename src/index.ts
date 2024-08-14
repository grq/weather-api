import express, { Express } from 'express'
import bodyParser from 'body-parser'
import dotenv from 'dotenv'
import { startConsumer } from './rabbitmq'
import apiRouter from './routes'
import morgan from 'morgan'
import { errorHandler } from './error-handler'
import logger from './logger'

dotenv.config()

const app: Express = express()

if (process.env.NODE_ENV === 'production') {
    app.use(morgan('combined', {
        stream: {
            write: (message) => logger.info(message.trim())
        }
    }))
} else {
    app.use(morgan('dev', {
        stream: {
            write: (message) => logger.debug(message.trim())
        }
    }))
}
app.use(bodyParser.json())
app.use('/', apiRouter)
app.use(errorHandler)

const port: number = parseInt(process.env.PORT as string, 10) || 3000

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})

startConsumer()