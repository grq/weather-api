const amqp = require('amqplib');
const { Pool } = require('pg');

const rabbitMQUrl = process.env.RABBITMQ_URL;
const rabbitQueue = 'user-requests';

module.exports = (on, config) => {
    on('task', {
        async getMessagesFromQueue() {
        const connection = await amqp.connect(rabbitMQUrl);
        const channel = await connection.createChannel();
        await channel.assertQueue(rabbitQueue);
        
        const messages = [];
        channel.consume(rabbitQueue, (msg) => {
            if (msg !== null) {
            messages.push(JSON.parse(msg.content.toString()));
            channel.ack(msg); // Acknowledge that the message has been processed
            }
        }, { noAck: false });
        
        return new Promise((resolve) => {
            setTimeout(() => {
            channel.close();
            connection.close();
            resolve(messages);
            }, 1000); // Adjust the timeout as needed
        });
        },
    });
};