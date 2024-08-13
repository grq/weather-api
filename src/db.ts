import { Pool } from 'pg'
import { IUser, IWeather } from './types'

const pool = new Pool({
    user: process.env.POSTGRES_USER,
    host: process.env.DB_HOST,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    port: Number(process.env.DB_PORT)
})

const query = async (query: string, params: any[]) => {
    try {
        const result = await pool.query(query, params)
        console.log('query success', query, params)
        return result.rows
    } catch (e) {
        console.log('query error', e)
        throw e
    }
}

export const getUser = async (username: string, password: string): Promise<IUser | null> => {
    const result = await query('SELECT * FROM users WHERE username = $1 AND password = $2', [username, password])
    if (result.length === 1) {
        return { id: result[0].id, username: result[0].username }
    }
    return null
}

export const getWeather = async (city: string, date: string): Promise<IWeather | null> => {
    const result = await query('SELECT temperature, condition FROM weather WHERE city = $1 AND date = $2', [city, date])
    if (result.length === 1) {
        return {
            temperature: result[0].temperature,
            condition: result[0].condition
        }
    }
    return null
}
