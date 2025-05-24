import * as fs from "fs";
import * as http from "http";
import * as https from "https";
import app from "./app";
import {Server} from "./global";
import connectDatabase from "./startup/database";
import passportStartup from "./startup/passport";
import env from "./utils/validate-env";
import {AppLogger, ErrorLogger} from "./utils/logging";

// Load environment variables
const isProduction = process.env.NODE_ENV === "production";
console.log("Environment: ", process.env.NODE_ENV)
console.log("Is Production: ", isProduction)

const port = env.PORT;

// Initialize server variable
let server: Server;

// Create HTTP server for development or HTTPS server for production
if (isProduction) {
    server = https.createServer({
        key: fs.readFileSync(process.env.SERVER_KEY_PATH || 'server.key'),
        cert: fs.readFileSync(process.env.SERVER_CERT_PATH || 'server.cert')
    }, app);
} else {
    server = http.createServer(app);
}

// Setup database, logging, and passport authentication
connectDatabase()
    .then(() => {
        AppLogger.info('--> 1. Mongoose connected!');
        return passportStartup(app);
    })
    .then(() => {
        AppLogger.info('--> 2. Passport started!');
        // Start the server
        server.listen(port, () => {
            AppLogger.info('--> 3. Server successfully started at port: ' + port);
            AppLogger.info('================================================ \n');
        });
    })
    .catch(error => {
        AppLogger.error('Error during startup:', error);
        ErrorLogger.error('Error during startup:', error);
        // Exit the process in case of startup error
        process.exit(1);
    });

export default app;
