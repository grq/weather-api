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

    it('should deny access without authorization', () => {
        cy.request({
            method: 'GET',
            url: `${weatherUrl}?city=${city}&date=${date}`,
            failOnStatusCode: false
        }).then(response => {
            expect(response.status).to.eq(401)
            expect(response.body).to.eq('Unauthorized')
        })
    })

    it('should return weather data for authorized user and valid city and date', () => {
        cy.request({
            method: 'GET',
            url: `${weatherUrl}?city=${city}&date=${date}`,
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        }).then(response => {
            expect(response.status).to.eq(200)
            expect(response.body).to.have.property('temperature')
            expect(response.body).to.have.property('condition')
        })
    })

    it('should return error for missing city parameter', () => {
        cy.request({
            method: 'GET',
            url: `${weatherUrl}?date=${date}`,
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
            failOnStatusCode: false
        }).then(response => {
            expect(response.status).to.eq(400)
            expect(response.body).to.eq('City and date are required')
        })
    })

    it('should return error for missing date parameter', () => {
        cy.request({
            method: 'GET',
            url: `${weatherUrl}?city=${city}`,
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
            failOnStatusCode: false
        }).then(response => {
            expect(response.status).to.eq(400)
            expect(response.body).to.eq('City and date are required')
        })
    })

    it('should allow requests within the time limit', () => {
        cy.wait(1001)

        for (let i = 0; i < requestLimit; i++) {
            cy.request({
                method: 'GET',
                url: `${weatherUrl}?city=${city}&date=${date}`,
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            }).then(response => {
                expect(response.status).to.eq(200)
                expect(response.body).to.have.property('temperature')
                expect(response.body).to.have.property('condition')
            })
        }
    })

    it('should return 429 Too Many Requests when exceeding the time limit', () => {
        cy.wait(1001)

        for (let i = 0; i < requestLimit + 1; i++) {
            cy.request({
                method: 'GET',
                url: `${weatherUrl}?city=${city}&date=${date}`,
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                },
                failOnStatusCode: false
            }).then(response => {
                if (i < requestLimit) {
                    expect(response.status).to.eq(200)
                } else {
                    cy.wait(1001)
                    expect(response.status).to.eq(429)
                    expect(response.body).to.eq('Too many requests')
                }
            })
        }
    })

    it('should increase user weather requests limit', () => {
        cy.request({
            method: 'GET',
            url: limitGetUrl,
            headers: { 'Authorization': `Bearer ${accessToken}` }
        }).then(response => {
            const currentLimit = response.body.limit

            cy.request({
                method: 'GET',
                url: `${weatherUrl}?city=${city}&date=${date}`,
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            }).then(() => {
                cy.request({
                    method: 'GET',
                    url: limitGetUrl,
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                }).then(response => {
                    expect(response.body.limit).to.eq(currentLimit + 1)
                })
            })
        })
    })
})
