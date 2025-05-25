import "dotenv/config";
import express from "express";
import {Authentication} from "./middleware/authentication";
import {RequestLoggerHandler} from "./middleware/request-logger";
import {ResponseHandler} from "./middleware/response-handler";
import {jsonErrorHandler} from "./middleware/error-handler";
import * as routes from "./routes";
import morgan from "morgan";
import cors from 'cors';
import favicon from 'serve-favicon';
import * as favPath from 'path';
import {Role} from "./enums/auth";
import {verifyRole} from "./middleware/verify-role";

const isProduction = process.env.NODE_ENV === "production";
const app = express();

app.use(RequestLoggerHandler);
app.use(ResponseHandler);

app.use(express.json({limit: '20mb'}));
app.use(express.urlencoded({limit: '20mb', extended: true}));

const defaultOrigins = ['https://entinsight.com', 'https://www.entinsight.com'];

if (!isProduction) {
    const allowedOrigin = process.env.ALLOWED_ORIGIN;
    const allowedOrigins = allowedOrigin?.split(',').concat(defaultOrigins) ?? defaultOrigins;
    console.log(`Allowed Origins: ${allowedOrigins.join(', ')}`);

    app.use(morgan("dev"));
    // app.use(cors({
    //     optionsSuccessStatus: 200,
    //     origin: '*',
    //     allowedHeaders: ['Content-Type, Access-Control-Allow-Headers, Access-Control-Allow-Origin, Authorization, X-Requested-With', 'Cache-Control']
    // }));
    app.use(cors({
        // origin: isProduction ? process.env.ALLOWED_ORIGIN : 'http://localhost:3000', //TODO: check?
        origin: allowedOrigins, //TODO: check?
        credentials: true, // Allow cookies and credentials
        optionsSuccessStatus: 200,
        allowedHeaders: [
            'Content-Type',
            'Authorization',
            'X-Requested-With',
            'source',
            'platform',
            'Cache-Control',
        ],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Explicitly define allowed HTTP methods
    }));
} else {
    app.use(morgan('combined'));
    app.use(cors({
        origin: defaultOrigins
    }));
}

app.use(favicon(favPath.join(__dirname, "../resources", "favicon.ico")));
app.use('/api/static', express.static(favPath.join(__dirname, "../resources")));

app.use('/api/auth', Authentication.verifyToken);
app.use('/api/admin', Authentication.verifyToken, verifyRole([Role.ADMIN]));
app.use('/api/doctor', Authentication.verifyToken, verifyRole([Role.DOCTOR]));
app.use('/api/radiologist', Authentication.verifyToken, verifyRole([Role.RADIOLOGIST]));
app.use('/api/student', Authentication.verifyToken, verifyRole([Role.STUDENT]));
app.use('/api/patient', Authentication.verifyToken, verifyRole([Role.PATIENT]));
routes.initRoutes(app);

// Error Handling
app.use(jsonErrorHandler);

export default app;
