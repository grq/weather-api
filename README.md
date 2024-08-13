## Available Scripts

### `npm run docker:up`

Builds and starts the application along with its dependencies (PostgreSQL, Redis, RabbitMQ) using Docker Compose.

### `npm run docker:down`

Stops and removes the Docker containers started by `npm run docker:up`.

### `npm test`

Runs the unit tests using Jest in band mode (sequential execution).

### `npm run test:cypress`

Runs the end-to-end tests using Cypress.

### `npm start`

Runs the application. The server will be started from the compiled JavaScript files in the `dist` directory.

### `npm run start:dev`

Runs the application in development mode using `ts-node`.

### `npm run watch`

Watches the TypeScript files for changes and automatically recompiles them using `tsc-watch`. The server is restarted on successful compilation.

### `npm run build`

Compiles the TypeScript files into JavaScript. The output files are placed in the `dist` directory.