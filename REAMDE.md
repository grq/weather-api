## Available Scripts

In the project directory, you can run the following scripts:

### `npm start`

Runs the application in production mode. The server will be started from the compiled JavaScript files in the `dist` directory.

### `npm run start:dev`

Runs the application in development mode using `ts-node`. This allows you to run the TypeScript files directly without compiling them first.

### `npm run watch`

Watches the TypeScript files for changes and automatically recompiles them using `tsc-watch`. The server is restarted on successful compilation.

### `npm run build`

Compiles the TypeScript files into JavaScript. The output files are placed in the `dist` directory.

### `npm run docker:up`

Builds and starts the application along with its dependencies (PostgreSQL, Redis, RabbitMQ) using Docker Compose. This is useful for running the application in a containerized environment.

### `npm run docker:down`

Stops and removes the Docker containers started by `npm run docker:up`. This cleans up the environment and frees up resources.



### `npm test`

Runs the unit tests using Jest in band mode (sequential execution). This is useful for ensuring that tests run one at a time, which can be important for tests that rely on shared resources.

### `npm run test:cypress`

Runs the end-to-end tests using Cypress. This is helpful for testing the application in a real browser environment to simulate user interactions.