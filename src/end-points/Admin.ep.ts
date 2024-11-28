import {NextFunction, Request, Response} from "express";
import { Role, SignedUpAs} from "../enums/auth";
import {AuthUserData} from "../types/util-types";
import {AppLogger, ErrorLogger} from "../utils/logging";
import {DAdmin} from "../models/Admin.model";
import * as AdminDao from "../dao/Admin.dao";
import env from "../utils/validate-env";

export async function register(req: Request, res: Response, next: NextFunction) {
    const {_id: id, role, name, email, password, adminId, nic, superAdminToken, remember} = req.body;
    if (superAdminToken && superAdminToken === env.ADMIN_TOKEN ) {
        AppLogger.info(`User registering by super admin token (Email: ${email})`);
        const data: DAdmin = {
            nic: nic,
            adminId: adminId,
            name: name,
            email: email,
            password: password,
            signedUpAs: SignedUpAs.EMAIL,
            lastLoggedIn: new Date(),
            // role: Role.ADMIN, // Role set in schema
            permissions: Role.getPermissions(Role.ADMIN),
        };
        AdminDao.createProfile(data, !!remember).then(async (data: AuthUserData) => {
            AppLogger.info(`User registered as ${Role.getTitle(role)} ID: ${id}`);
            res.sendSuccess(data, `User Registered as ${Role.getTitle(role)}!`);
        }).catch(next);
    } else {
        AppLogger.error(`Try user registering as Admin (Token: ${superAdminToken})`);
        ErrorLogger.error(`User registering as Admin: Illegal attempt`);
        res.sendError(`Illegal attempt!`, 403);
    }
}
