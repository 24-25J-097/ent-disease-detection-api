import {isHttpError} from "http-errors";
import {Request, Response, NextFunction} from 'express';
import * as mongoose from "mongoose";
import {AppLogger, ErrorLogger} from '../utils/logging';
import {ApplicationError} from '../utils/application-error';

export const jsonErrorHandler = (error: unknown | Error, req: Request, res: Response, next: NextFunction) => {
    let errorMessage = "An internal server error occurred";
    let statusCode = 500;
    if (isHttpError(error)) {
        statusCode = error.status;
        errorMessage = error.message;
    } else if (error instanceof ApplicationError) {
        AppLogger.error(error.message);
        statusCode = error.statusCode;
        errorMessage = error.message;
    } else if (error instanceof mongoose.Error) {
        errorMessage = error.message;
        ErrorLogger.error(error);
    }
    res.status(statusCode).json({
        status: "error",
        statusCode,
        message: errorMessage,
    });
}
