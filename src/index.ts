import express, { Express } from 'express'
import bodyParser from 'body-parser'
import dotenv from 'dotenv'
import { startConsumer } from './rabbitmq'
import routes from './routes'

dotenv.config()

const app: Express = express()
app.use(bodyParser.json())
app.use('/', routes)

const port: number = parseInt(process.env.PORT as string, 10) || 3000

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})

startConsumer()