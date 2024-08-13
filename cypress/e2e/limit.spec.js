describe('/limitreset', () => {
    const limitResetUrl = '/limitreset'
    const limitGetUrl = '/limitget'
    const weatherUrl = '/weather'
    const authUrl = '/auth/login'
    const city = 'Moscow'
    const date = '2024-08-01'

    let accessToken

    before(() => {
        cy.request('POST', authUrl, {
            username: 'admin',
            password: 'admin123'
        }).then((response) => {
            accessToken = response.body.accessToken
            expect(response.status).to.eq(200)
            expect(accessToken).to.exist
        })
    })

    it('should reset current user weather requests limit', () => {
        cy.request({
            method: 'GET',
            url: limitResetUrl,
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        }).then((response) => {
            expect(response.body.limit).to.eq(0)
        })

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
            }).then((response) => {
                expect(response.body.limit).not.to.eq(0)

                cy.request({
                    method: 'GET',
                    url: limitResetUrl,
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                }).then((response) => {
                    expect(response.body.limit).to.eq(0)
                })
            })
        })
    })
})
