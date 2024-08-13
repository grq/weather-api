describe('/weather', () => {
    const limitResetUrl = '/limitreset'
    const limitGetUrl = '/limitget'
    const weatherUrl = '/weather'
    const authUrl = '/auth/login'
    const city = 'Moscow'
    const date = '2024-08-01'
    const requestLimit = 5
    const weatherRequestLimit = 100

    let accessToken

    before(() => {
        cy.request('POST', authUrl, {
            username: 'admin',
            password: 'admin123'
        }).then(response => {
            accessToken = response.body.accessToken
            expect(response.status).to.eq(200)
            expect(accessToken).to.exist
        })
    })

    beforeEach(() => {
        cy.request({
            method: 'GET',
            url: limitResetUrl,
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        })
    })

    it('should return 403 Too Many Requests when exceeding the user weather requests limit', () => {
        const delay = 201
        cy.request({
            method: 'GET',
            url: `${limitGetUrl}`,
            headers: { 'Authorization': `Bearer ${accessToken}` }
        }).then(response => {
            const requestsLeft = weatherRequestLimit - response.body.limit
            cy.log(`response.body.limit`, response.body.limit)
            cy.log(`requestsLeft`, requestsLeft)
            for (let i = 0; i < requestsLeft + 1; i++) {
                cy.wait(delay)
                cy.request({
                    method: 'GET',
                    url: `${weatherUrl}?city=${city}&date=${date}`,
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    },
                    failOnStatusCode: false
                }).then(response => {
                    if (i < requestsLeft) {
                        expect(response.status).to.eq(200)
                    } else {
                        expect(response.status).to.eq(403)
                        expect(response.body).to.eq('User request limit exceeded')
                        // cy.task('getMessagesFromQueue').then(messages => {
                        //     cy.log(messages)
                        //     expect(messages.length).to.be.greaterThan(0)
                        //     const message = messages[0]
                        //     expect(message).to.have.property('userId')
                        //     expect(message).to.have.property('userLimit')
                        // })
                    }
                })
            }
        })
    })
})
