require('dotenv').config()

module.exports = {
    roots: ['./tests'],
    globals: {
        BASE_URL: 'http://localhost:3000',
        TEST_USER: 'admin',
        TEST_PASS: 'admin123',
        URL_LOGIN: '/auth/login',
        URL_WEATHER: '/weather',
        URL_LIMITGET: '/limitget',
        URL_LIMITRESET: '/limitreset',
        TEST_CITY: 'Moscow',
        TEST_DATE: '2024-08-01',
        WEATHER_LIMIT_TIMESPAN: parseInt(process.env.WEATHER_LIMIT_TIMESPAN),
        WEATHER_LIMIT_TIMESPAN_CALLS: parseInt(process.env.WEATHER_LIMIT_TIMESPAN_CALLS),
        WEATHER_TOTAL_LIMIT: parseInt(process.env.WEATHER_TOTAL_LIMIT)
    }
}