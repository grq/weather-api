import nodemailer, { Transporter, SendMailOptions } from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

let transport: Transporter

const getTransport = (): Transporter => {
    if (!transport) {
        const emailSenderUser = process.env.EMAIL_SENDER_USER
        const emailSenderPass = process.env.EMAIL_SENDER_PASS
        if (emailSenderUser && emailSenderPass) {
            transport = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: emailSenderUser,
                    pass: emailSenderPass
                }
            })
        } else {
            throw new Error('Cannot create mail transport: missing required environment variables')
        }
    }
    return transport
}

export const sendUserRequestLimitExceed = async (userId: number): Promise<void> => {
    const emailRecipient = process.env.EMAIL_RECIPIENT
    if (emailRecipient) {
        const mailOptions: SendMailOptions = {
            from: 'Notification center',
            to: emailRecipient,
            subject: 'User Request Limit Exceeded',
            text: `User ${userId} exceeded the request limit.`
        }
    
        try {
            const result = await getTransport().sendMail(mailOptions)
            if (!result.accepted.includes(emailRecipient)) {
                throw new Error('Email was not accepted')
            }
        } catch (error) {
            console.error('Error sending email:', error)
            throw error
        }
    } else {
        throw new Error('Cannot send email notification: missing required environment variables')
    }
}
