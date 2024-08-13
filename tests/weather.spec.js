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

    it('should deny access without authorization', async () => {
        const response = await request(BASE_URL)
            .get(`${URL_WEATHER}?city=${TEST_CITY}&date=${TEST_DATE}`)
            .expect(401)
        
        expect(response.text).toBe('Unauthorized')
    })

    it('should return weather data for authorized user and valid city and date', async () => {
        const response = await request(BASE_URL)
            .get(`${URL_WEATHER}?city=${TEST_CITY}&date=${TEST_DATE}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200)
        
        expect(response.body).toHaveProperty('temperature')
        expect(response.body).toHaveProperty('condition')
    })

    it('should return error for missing city parameter', async () => {
        const response = await request(BASE_URL)
            .get(`${URL_WEATHER}?date=${TEST_DATE}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(400)
        
        expect(response.text).toBe('City and date are required')
    })

    it('should return error for missing date parameter', async () => {
        const response = await request(BASE_URL)
            .get(`${URL_WEATHER}?city=${TEST_CITY}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(400)
        
        expect(response.text).toBe('City and date are required')
    })

    it('should allow requests within the time limit', async () => {
        await request(BASE_URL)
            .get(URL_LIMITRESET)
            .set('Authorization', `Bearer ${accessToken}`)

        await new Promise(resolve => setTimeout(resolve, WEATHER_LIMIT_TIMESPAN + 1))

        for (let i = 0; i < WEATHER_LIMIT_TIMESPAN_CALLS; i++) {
            const response = await request(BASE_URL)
                .get(`${URL_WEATHER}?city=${TEST_CITY}&date=${TEST_DATE}`)
                .set('Authorization', `Bearer ${accessToken}`)

            expect(response.status).toBe(200)
            expect(response.body).toHaveProperty('temperature')
            expect(response.body).toHaveProperty('condition')
        }
    })

    it('should return 429 Too Many Requests when exceeding the time limit', async () => {
        await request(BASE_URL)
            .get(URL_LIMITRESET)
            .set('Authorization', `Bearer ${accessToken}`)

        await new Promise(resolve => setTimeout(resolve, WEATHER_LIMIT_TIMESPAN + 1))

        for (let i = 0; i < WEATHER_LIMIT_TIMESPAN_CALLS + 1; i++) {
            const response = await request(BASE_URL)
                .get(`${URL_WEATHER}?city=${TEST_CITY}&date=${TEST_DATE}`)
                .set('Authorization', `Bearer ${accessToken}`)
            if (i < WEATHER_LIMIT_TIMESPAN_CALLS) {
                expect(response.status).toBe(200)
            } else {
                expect(response.status).toBe(429)
                expect(response.text).toBe('Too many requests')
                await new Promise(resolve => setTimeout(resolve, WEATHER_LIMIT_TIMESPAN + 1))
            }
        }
    })

    it('should increase user weather requests limit', async () => {
        await request(BASE_URL)
            .get(URL_LIMITRESET)
            .set('Authorization', `Bearer ${accessToken}`)

        const limitResponseBefore = await request(BASE_URL)
            .get(URL_LIMITGET)
            .set('Authorization', `Bearer ${accessToken}`)

        const currentLimit = limitResponseBefore.body.limit

        await request(BASE_URL)
            .get(`${URL_WEATHER}?city=${TEST_CITY}&date=${TEST_DATE}`)
            .set('Authorization', `Bearer ${accessToken}`)

        const limitResponseAfter = await request(BASE_URL)
            .get(URL_LIMITGET)
            .set('Authorization', `Bearer ${accessToken}`)

        expect(limitResponseAfter.body.limit).toBe(currentLimit + 1)
    })
})