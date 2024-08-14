import express, { Express } from 'express'
import bodyParser from 'body-parser'
import dotenv from 'dotenv'
import { startConsumer } from './rabbitmq'
import apiRouter from './routes'
import { errorHandler } from './error-handler'

dotenv.config()

const app: Express = express()

app.use(bodyParser.json())
app.use('/', apiRouter)
app.use(errorHandler)

const port: number = parseInt(process.env.PORT as string, 10) || 3000

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})

startConsumer()