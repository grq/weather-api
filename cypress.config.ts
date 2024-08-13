import { defineConfig } from 'cypress';
import { getMessagesFromQueue } from './src/rabbitmq';

export default defineConfig({
    e2e: {
        baseUrl: 'http://localhost:3000',
        setupNodeEvents(on) {
            on('task', {
                getMessagesFromQueue: () => getMessagesFromQueue()
            })
        },
        specPattern: 'cypress/e2e/**/*.spec.{js,jsx,ts,tsx}',
        supportFile: 'cypress/support/e2e.{js,jsx,ts,tsx}'
    }
})
