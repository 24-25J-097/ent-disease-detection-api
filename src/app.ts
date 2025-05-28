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
import {apiAccessControl} from "./middleware/api-access-control";
import {RoleAccessPolicyDAO} from "./dao/RoleAccessPolicy.dao";

const isProduction = process.env.NODE_ENV === "production";
const app = express();

app.use(RequestLoggerHandler);
app.use(ResponseHandler);

app.use(express.json({limit: '20mb'}));
app.use(express.urlencoded({limit: '20mb', extended: true}));

const defaultOrigins = ['https://entinsight.com', 'https://www.entinsight.com', 'http://localhost:3000'];

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

// Serve API documentation
app.use(express.static(favPath.join(__dirname, "public")));
app.use('/docs', express.static(favPath.join(__dirname, "public/docs")));

// Initialize role access policies
(async () => {
    try {
        await RoleAccessPolicyDAO.initialize();
    } catch (error) {
        console.error('Error initializing role access policies:', error);
    }
})();

// Authentication middleware for all protected routes
app.use('/api/auth', Authentication.verifyToken);

// API access control middleware for authenticated routes
// Exclude plan management routes
app.use('/api/auth', (req, res, next) => {
    // Skip API access control for plan management routes
    if (
        req.path === '/active-plan' ||
        req.path === '/my-plans' ||
        req.path === '/purchase-package' ||
        req.path.startsWith('/cancel-plan/')
    ) {
        return next();
    }

    return next();
    // Apply API access control to all other authenticated routes
    // return apiAccessControl(req, res, next);
});

// Admin routes - bypass API access control
app.use('/api/admin', Authentication.verifyToken, verifyRole([Role.ADMIN]));

// Role-specific routes with API access control
app.use('/api/doctor', Authentication.verifyToken, verifyRole([Role.DOCTOR]), apiAccessControl);
app.use('/api/radiologist', Authentication.verifyToken, verifyRole([Role.RADIOLOGIST]), apiAccessControl);
app.use('/api/student', Authentication.verifyToken, verifyRole([Role.STUDENT]), apiAccessControl);
app.use('/api/patient', Authentication.verifyToken, verifyRole([Role.PATIENT]), apiAccessControl);
routes.initRoutes(app);

// Error Handling
app.use(jsonErrorHandler);

export default app;
