import {DRadiologist} from "../models/Radiologist.model";
import {DUser} from "../models/User.model";
import Radiologist from "../schemas/Radiologist.schema";
import {AuthUserData} from "../types/util-types";
import {AppLogger} from "../utils/logging";
import * as UserDao from "./User.dao";
import {authTokenValidity} from "../end-points/User.ep";
import {sendEmail} from "../services/email.service";
import {EmailType} from "../enums/util";

export async function createProfile(data: DUser & Partial<DRadiologist>, remember: boolean): Promise<AuthUserData> {
    const iRadiologist = new Radiologist(data);
    const radiologist = await iRadiologist.save();
    AppLogger.info(`Create profile for user ID: ${radiologist._id}`);
    sendEmail({type: EmailType.CREATE_USER, to: data.email});
    return await UserDao.authenticateUser(data.email, data.password, data.signedUpAs, authTokenValidity(remember));
}
