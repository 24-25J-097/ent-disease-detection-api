import { Express, Request, Response } from "express";
import { AdminRoutesInit } from "./admin";
import { AuthRoutesInit } from "./auth";
import createHttpError from "http-errors";
import {DoctorRoutesInit} from "./doctor";
import {PatientRoutesInit} from "./patient";

export function initRoutes(app: Express) {
    /* TOP LEVEL REQUESTS */
    app.get('/api', (req: Request, res: Response) => res.sendSuccess("ENT Insight - REST API"));

    AuthRoutesInit(app);
    AdminRoutesInit(app);
    DoctorRoutesInit(app);
    PatientRoutesInit(app);

    /* INVALID REQUESTS */
    app.get('/', (req: Request, res: Response) => res.redirect(301, "/api"));
    app.use((req, res, next) => next(new createHttpError.NotFound()));
    // app.all('*', (req: Request, res: Response) => res.send("Invalid Route").status(404));

}
