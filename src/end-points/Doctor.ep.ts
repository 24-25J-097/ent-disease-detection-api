import {NextFunction, Request, Response} from "express";
import { Role, SignedUpAs} from "../enums/auth";
import {AuthUserData} from "../types/util-types";
import {AppLogger} from "../utils/logging";
import * as DoctorDao from "../dao/Doctor.dao";
import {DDoctor} from "../models/Doctor.model";

export async function register(req: Request, res: Response, next: NextFunction) {
    const {_id: id, role, name, email, password, nic, doctorId, remember} = req.body;
    const data: DDoctor = {
        nic: nic,
        doctorId: doctorId,
        name: name,
        email: email,
        password: password,
        signedUpAs: SignedUpAs.EMAIL,
        lastLoggedIn: new Date(),
        // role: Role.DOCTOR, // Role set in schema
        permissions: Role.getPermissions(Role.DOCTOR),
    };
    DoctorDao.createProfile(data, !!remember).then(async (data: AuthUserData) => {
        AppLogger.info(`User registered as ${Role.getTitle(role)} ID: ${id}`);
        res.sendSuccess(data, `User Registered as ${Role.getTitle(role)}!`);
    }).catch(next);
}
