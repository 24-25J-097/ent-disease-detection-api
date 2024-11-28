import {DAdmin} from "../models/Admin.model";
import {DUser} from "../models/User.model";
import Admin from "../schemas/Admin.schema";
import {AuthUserData} from "../types/util-types";
import {AppLogger} from "../utils/logging";
import * as UserDao from "./User.dao";
import {authTokenValidity} from "../end-points/User.ep";

export async function createProfile(data: DUser & Partial<DAdmin>, remember: boolean): Promise<AuthUserData> {
    const iAdmin = new Admin(data);
    const admin = await iAdmin.save();
    AppLogger.info(`Create profile for user ID: ${admin._id}`);
    // sendEmail({type: EmailType.CREATE_USER, to: data.email}); // TODO fire event to send emails
    return await UserDao.authenticateUser(data.email, data.password, data.signedUpAs, authTokenValidity(remember));
}
