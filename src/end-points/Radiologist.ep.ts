import {NextFunction, Request, Response} from "express";
import { Role, SignedUpAs} from "../enums/auth";
import {AuthUserData} from "../types/util-types";
import {AppLogger} from "../utils/logging";
import * as RadiologistDao from "../dao/Radiologist.dao";
import {DRadiologist} from "../models/Radiologist.model";

export async function register(req: Request, res: Response, next: NextFunction) {
    const {_id: id, role, name, email, password, nic, radiologistId, remember} = req.body;
    const data: DRadiologist = {
        nic: nic,
        radiologistId: radiologistId,
        name: name,
        email: email,
        password: password,
        signedUpAs: SignedUpAs.EMAIL,
        lastLoggedIn: new Date(),
        // role: Role.RADIOLOGIST, // Role set in schema
        permissions: Role.getPermissions(Role.RADIOLOGIST),
    };
    RadiologistDao.createProfile(data, !!remember).then(async (data: AuthUserData) => {
        AppLogger.info(`User registered as ${Role.getTitle(role)} ID: ${id}`);
        res.sendSuccess(data, `User Registered as ${Role.getTitle(role)}!`);
    }).catch(next);
}
