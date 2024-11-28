import {NextFunction, Request, Response} from "express";
import { Role } from "../enums/auth";
import { IUser } from "../models/User.model";
import createHttpError from "http-errors";

export function verifyRole(roles: Role[]) {
    return function (req: Request, res: Response, next: NextFunction) {
        const ownUser = req.user as IUser;
        if (ownUser && ownUser.role && roles.includes(<Role>(parseInt(ownUser.role.toString())))) {
            next();
        } else {
            throw createHttpError(403, "Permission denied.");
        }
    };
}
