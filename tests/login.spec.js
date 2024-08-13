const request = require('supertest')

describe('/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
        const response = await request(BASE_URL)
            .post(URL_LOGIN)
            .send({ username: TEST_USER, password: TEST_PASS })

        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty('accessToken')
    })

    it('should fail login with invalid credentials', async () => {
        const response = await request(BASE_URL)
            .post(URL_LOGIN)
            .send({
                username: TEST_USER,
                password: Math.random().toString(36)
            })

        expect(response.status).toBe(401)
    })
})