describe('/auth/login', () => {
    const apiUrl = '/auth/login'

    it('should login successfully with valid credentials', () => {
        const validCredentials = {
            username: 'admin',
            password: 'admin123'
        }

        cy.request('POST', apiUrl, validCredentials)
            .then((response) => {
                expect(response.status).to.eq(200)
                expect(response.body).to.have.property('accessToken')
            })
    })

    it('should fail login with invalid credentials', () => {
        const invalidCredentials = {
            username: 'admin',
            password: 'admin1234'
        }

        cy.request({
            method: 'POST',
            url: apiUrl,
            body: invalidCredentials,
            failOnStatusCode: false
        })
        .then((response) => {
            expect(response.status).to.eq(401)
        })
    })
})
