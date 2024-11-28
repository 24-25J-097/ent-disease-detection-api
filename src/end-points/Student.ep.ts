import {NextFunction, Request, Response} from "express";
import { Role, SignedUpAs} from "../enums/auth";
import {AuthUserData} from "../types/util-types";
import {AppLogger} from "../utils/logging";
import {DStudent} from "../models/Student.model";
import * as StudentDao from "../dao/Student.dao";

export async function register(req: Request, res: Response, next: NextFunction) {
    const {_id: id, role, name, email, password, studentId, remember} = req.body;
    const data: DStudent = {
        studentId: studentId,
        name: name,
        email: email,
        password: password,
        signedUpAs: SignedUpAs.EMAIL,
        lastLoggedIn: new Date(),
        // role: Role.STUDENT, // Role set in schema
        permissions: Role.getPermissions(Role.STUDENT),
    };
    StudentDao.createProfile(data, !!remember).then(async (data: AuthUserData) => {
        AppLogger.info(`User registered as ${Role.getTitle(role)} ID: ${id}`);
        res.sendSuccess(data, `User Registered as ${Role.getTitle(role)}!`);
    }).catch(next);
}
