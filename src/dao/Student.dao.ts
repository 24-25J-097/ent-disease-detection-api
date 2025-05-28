import {DStudent} from "../models/Student.model";
import {DUser} from "../models/User.model";
import Student from "../schemas/Student.schema";
import {AuthUserData} from "../types/util-types";
import {AppLogger} from "../utils/logging";
import * as UserDao from "./User.dao";
import {authTokenValidity} from "../end-points/User.ep";
import {sendEmail} from "../services/email.service";
import {EmailType} from "../enums/util";

export async function createProfile(data: DUser & Partial<DStudent>, remember: boolean): Promise<AuthUserData> {
    const iStudent = new Student(data);
    const student = await iStudent.save();
    AppLogger.info(`Create profile for user ID: ${student._id}`);
    sendEmail({type: EmailType.CREATE_USER, to: data.email});
    return await UserDao.authenticateUser(
        data.email,
        data.password,
        data.signedUpAs,
        authTokenValidity(remember),
        true
    );
}
