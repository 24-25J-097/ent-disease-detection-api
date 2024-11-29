import {NextFunction, Request, Response} from "express";
import {ApplicationError} from "../utils/application-error";
import {IUser} from "../models/User.model";
import {Permission, Role} from "../enums/auth";

export function verifyPermission(...permissions: Permission[]) {
    return function (req: Request, res: Response, next: NextFunction) {
        const user = req.user as IUser;
        if (user) {
            const [success, message, statusCode] = checkPermission(user, permissions);
            if (success) {
                next();
            } else {
                throw new ApplicationError(message, statusCode);
            }
        } else {
            // throw new ApplicationError("User is not authenticated", 401);
        }
    };
}

export function checkPermission(user: IUser, permissions: Permission[]): [boolean, string, number] {
    const userPermissions = Role.getPermissions(user.role);

    if (userPermissions.length === 0) {
        return [false, "Unknown user role", 400]; // Bad Request
    }

    const hasPermission = permissions.some(permission => userPermissions.includes(permission));

    if (hasPermission) {
        return [true, "Permission granted", 200]; // OK (used internally, not for throwing errors)
    } else {
        return [false, "Insufficient permissions", 403]; // Forbidden
    }
}
