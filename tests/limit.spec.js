const request = require('supertest')

describe('/limitreset', () => {
    let accessToken

    beforeAll(async () => {
        const response = await request(BASE_URL)
            .post(URL_LOGIN)
            .send({ username: TEST_USER, password: TEST_PASS })

        accessToken = response.body.accessToken
        expect(response.status).toBe(200)
        expect(accessToken).toBeDefined()
    })

    it('should reset current user weather requests limit', async () => {
        let response = await request(BASE_URL)
            .get(URL_LIMITRESET)
            .set('Authorization', `Bearer ${accessToken}`)

        expect(response.body.limit).toBe(0)

        await request(BASE_URL)
            .get(`${URL_WEATHER}?city=${TEST_CITY}&date=${TEST_DATE}`)
            .set('Authorization', `Bearer ${accessToken}`)

        response = await request(BASE_URL)
            .get(URL_LIMITGET)
            .set('Authorization', `Bearer ${accessToken}`)

        expect(response.body.limit).not.toBe(0)

        response = await request(BASE_URL)
            .get(URL_LIMITRESET)
            .set('Authorization', `Bearer ${accessToken}`)

        expect(response.body.limit).toBe(0)
    })
})