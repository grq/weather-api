const request = require('supertest')

describe('/weather', () => {
    let accessToken

    beforeAll(async () => {
        const response = await request(BASE_URL)
            .post(URL_LOGIN)
            .send({ username: TEST_USER, password: TEST_PASS });
        accessToken = response.body.accessToken

        expect(response.status).toBe(200)
        expect(accessToken).toBeDefined()

        await request(BASE_URL)
            .get(URL_LIMITRESET)
            .set('Authorization', `Bearer ${accessToken}`)
    })

    it('should return 403 Too Many Requests when exceeding the user weather requests limit', async () => {
        const delay = WEATHER_LIMIT_TIMESPAN / WEATHER_LIMIT_TIMESPAN_CALLS + 1

        for (let i = 0; i < WEATHER_TOTAL_LIMIT + 1; i++) {
            await new Promise(resolve => setTimeout(resolve, delay))

            const weatherResponse = await request(BASE_URL)
                .get(`${URL_WEATHER}?city=${TEST_CITY}&date=${TEST_DATE}`)
                .set('Authorization', `Bearer ${accessToken}`)

            if (i < WEATHER_TOTAL_LIMIT) {
                expect(weatherResponse.status).toBe(200)
            } else {
                expect(weatherResponse.status).toBe(403)
                expect(weatherResponse.text).toBe('User request limit exceeded')
            }
        }
    }, 5000 + (WEATHER_TOTAL_LIMIT / WEATHER_LIMIT_TIMESPAN_CALLS * WEATHER_LIMIT_TIMESPAN))
})