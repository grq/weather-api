import amqplib, { Channel, Connection, ConsumeMessage } from 'amqplib'
import { sendUserRequestLimitExceed } from './email'
import dotenv from 'dotenv'

dotenv.config()

const limitExceededQueue = 'request-limit-exceeded'

let _channel: Channel | null = null

export const connect = async (): Promise<Channel> => {
    if (!_channel) {
        try {
            const rabbitMQUrl = process.env.RABBITMQ_URL
            if (rabbitMQUrl && typeof rabbitMQUrl === 'string') {
                const connection: Connection = await amqplib.connect(rabbitMQUrl)
                _channel = await connection.createChannel()
                await _channel.assertQueue(limitExceededQueue)
            } else {
                throw new Error('Failed to start RabbitMQ client: no url provided')
            }
        } catch (e) {
            throw new Error('Failed to start RabbitMQ client: ' + (e as Error).message)
        }
    }
    return _channel
}

export const sendToLimitExceededQueue = async (message: any): Promise<void> => {
    const channel = await connect()
    channel.sendToQueue(limitExceededQueue, Buffer.from(JSON.stringify(message)))
}

export const startConsumer = async (): Promise<void> => {
    const channel = await connect()
    console.log('Waiting for messages in %s.', limitExceededQueue)
    channel.consume(limitExceededQueue, async (msg: ConsumeMessage | null) => {
        if (msg !== null) {
            const { userId } = JSON.parse(msg.content.toString())
            try {
                await sendUserRequestLimitExceed(userId)
                console.log(`"User ${userId} request limit exceed" email sent successfully`)
                channel.ack(msg)
            } catch (e) {
                console.log(`"User ${userId} request limit exceed" failed to send`)
                if (!msg.fields.redelivered) {
                    console.log(`"User ${userId} request limit exceed" message pushed back to queue`)
                    channel.nack(msg, false, true)
                }
            }
        }
    })
}

export const getMessagesFromQueue = async () => {
    const channel = await connect()
    const messages = []
    const msg = await channel.get(limitExceededQueue)
    if (msg) {
        messages.push(JSON.parse(msg.content.toString()))
    }
    return messages
}
