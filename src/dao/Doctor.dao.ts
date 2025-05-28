import {DDoctor} from "../models/Doctor.model";
import {DUser} from "../models/User.model";
import Doctor from "../schemas/Doctor.schema";
import {AuthUserData} from "../types/util-types";
import {AppLogger} from "../utils/logging";
import * as UserDao from "./User.dao";
import {authTokenValidity} from "../end-points/User.ep";
import {sendEmail} from "../services/email.service";
import {EmailType} from "../enums/util";

export async function createProfile(data: DUser & Partial<DDoctor>, remember: boolean): Promise<AuthUserData> {
    const iDoctor = new Doctor(data);
    const doctor = await iDoctor.save();
    AppLogger.info(`Create profile for user ID: ${doctor._id}`);
    sendEmail({type: EmailType.CREATE_USER, to: data.email});
    return await UserDao.authenticateUser(data.email, data.password, data.signedUpAs, authTokenValidity(remember));
}
