import {Express, Request, Response} from "express";
import {AdminRoutesInit} from "./admin";
import {AuthRoutesInit} from "./auth";
import createHttpError from "http-errors";
import path from "path";
import {DoctorRoutesInit} from "./doctor";
import {PatientRoutesInit} from "./patient";
import {StudentRoutesInit} from "./student";
import {NotificationRoutesInit} from "./notification";


export function initRoutes(app: Express) {
    /* TOP LEVEL REQUESTS */
    app.get('/api', (req: Request, res: Response) => res.sendSuccess("ENT Insight - REST API"));

    AuthRoutesInit(app);
    AdminRoutesInit(app);
    DoctorRoutesInit(app);
    StudentRoutesInit(app);
    PatientRoutesInit(app);
    NotificationRoutesInit(app);

    /* DOCUMENTATION */
    app.get('/', (req: Request, res: Response) => res.sendFile(path.join(__dirname, '../public/docs/index.html')));

    /* INVALID REQUESTS */
    app.use((req, res, next) => next(new createHttpError.NotFound()));
}
