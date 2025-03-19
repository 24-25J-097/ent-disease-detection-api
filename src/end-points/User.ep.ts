import {NextFunction, Request, Response} from "express";
import * as UserDao from "../dao/User.dao";
import * as DoctorEp from "../end-points/Doctor.ep";
import * as RadiologistEp from "../end-points/Radiologist.ep";
import * as StudentEp from "../end-points/Student.ep";
import * as AdminEp from "../end-points/Admin.ep";
import {Role} from "../enums/auth";
import {AuthValidations} from "../middleware/validations/auth-validations";
import {validationsChecker} from "../middleware/validations/validation-handler";
import {IUser} from "../models/User.model";
import {AppLogger, ErrorLogger} from "../utils/logging";
import {AuthUserData} from "../types/util-types";
import {UserValidations} from "../middleware/validations/user-validations";
import {Types} from "mongoose";

export function updateUserValidationRules(isSelf = false) {
    const rules = [
        UserValidations.name(),
        UserValidations.email(),
        UserValidations.phone(),
    ];
    if (isSelf) {
        return  rules;
    } else {
        return rules.concat(UserValidations.userId());
    }
}

export function fetchUserValidationRules() {
    return [UserValidations.userId()];
}

export function authenticateValidationRules() {
    return [
        AuthValidations.email(),
        AuthValidations.passwordLogin(),
    ];
}

export function registerValidationRules() {
    return [
        AuthValidations.role([Role.ADMIN, Role.DOCTOR, Role.RADIOLOGIST, Role.STUDENT ]),
        AuthValidations.email(),
        AuthValidations.name().optional({checkFalsy: true}),
        AuthValidations.password(),
        AuthValidations.confirmPassword(),
        AuthValidations.phone().optional(),
        // AuthValidations.studentId().if(AuthValidations.role([Role.STUDENT])).optional(),
        AuthValidations.nic().if(AuthValidations.role([Role.ADMIN])).optional(),
        // AuthValidations.adminId().if(AuthValidations.role([Role.ADMIN])).optional(),
        AuthValidations.adminToken().if(AuthValidations.role([Role.ADMIN])).optional(),
    ];
}

export function authTokenValidity(remember: boolean) : string {
    return remember ? "365 days" : "1 day";
}

export async function tester(req: Request, res: Response, next: NextFunction) {
    const { email, password, signedUpAs, remember } = req.body;
    try {
        const data = {"Test email": email, "Password": password, "Remember": remember, "signedAs": signedUpAs};
        res.sendSuccess(data, `User logged as ****!`);
    } catch (e){
        next();
    }
}

export async function loginUser(req: Request, res: Response, next: NextFunction) {
    const { email, password, signedUpAs, remember } = req.body;

    if (validationsChecker(req, res)) {
        UserDao.authenticateUser(email, password, signedUpAs, authTokenValidity(remember))
            .then(async (data: AuthUserData) => {
                // res.cookie('token', data.token, {
                //     httpOnly: true, secure: false, maxAge: Time.getDaysIn(Time.Milliseconds, authTokenValidity(remember))
                // });
                res.sendSuccess(data, `User logged as ${Role.getTitle(data.user.role)}!`);
            })
            .catch(next);
    }
}

export async function registerUser(req: Request, res: Response, next: NextFunction) {
    if (validationsChecker(req, res)) {
        const { role, email, adminToken = null } = req.body;
        const user = await UserDao.getUserByEmail(email);
        AppLogger.info(`New user tried to register as ${role} by ${email}`);

        if (user) {
            AppLogger.error(`User already exits!`);
            res.sendError('User Already Exits!', 409);
        } else {
            if (role === Role.DOCTOR) {
                try {
                    await DoctorEp.register(req, res, next);
                } catch (e) {
                    ErrorLogger.error(`User registration: ${e}`);
                    res.sendError(e);
                }
            } else if (role === Role.RADIOLOGIST) {
                try {
                    await RadiologistEp.register(req, res, next);
                } catch (e) {
                    ErrorLogger.error(`User registration: ${e}`);
                    res.sendError(e);
                }
            } else if (role === Role.STUDENT) {
                try {
                    await StudentEp.register(req, res, next);
                } catch (e) {
                    ErrorLogger.error(`User registration: ${e}`);
                    res.sendError(e);
                }
            } else if (role === Role.ADMIN) {
                if (adminToken) {
                    try {
                        await AdminEp.register(req, res, next);
                    } catch (e) {
                        ErrorLogger.error(`User registration: ${e}`);
                        res.sendError(e);
                    }
                } else {
                    AppLogger.error(`Unauthorized Role!`);
                    res.sendError('Unauthorized Role!');
                }
            } else {
                AppLogger.error(`Role Required!`);
                res.sendError('Role Required!');
            }
        }
    }
}

export async function getAll(req: Request, res: Response, next: NextFunction) {
    const ownUser = req.user as IUser;
    if (ownUser) {
        AppLogger.info(`Get all users`);
        await UserDao.getAllUsers(ownUser).then(user => {
            res.sendSuccess(user, "Get all Users successfully!");
        }).catch(next);
    } else {
        ErrorLogger.error(`Get all users: Illegal attempt`);
        res.sendError(`Illegal attempt!`, 403);
    }
}

export function getSelf(req: Request, res: Response, next: NextFunction) {
    const ownUser = req.user as IUser;
    if (ownUser) {
        UserDao.getUser(ownUser._id).then((user: IUser) => {
            res.sendSuccess(user);
        }).catch(next);
    } else {
        ErrorLogger.error(`Get self: Illegal attempt`);
        res.sendError(`Illegal attempt!`, 403);
    }
}

export function getUser(req: Request, res: Response, next: NextFunction) {
    if (validationsChecker(req, res)) {
        const userId = req.params._id as unknown as Types.ObjectId;
        UserDao.getUser(userId).then(user => {
            res.sendSuccess(user, "Get user by ID successfully!");
        }).catch(next);
    }
}

export async function updateSelf(req: Request, res: Response, next: NextFunction) {
    if (validationsChecker(req, res)) {
        const {email, phone, name} = req.body;
        const emailCheckUser = await UserDao.getUserByEmail(email);
        const ownUser = req.user as IUser;

        if (ownUser) {
            AppLogger.warn(`emailCheckUser ID: ${emailCheckUser?._id} | update user ID: ${ownUser._id}`);
            AppLogger.warn(`emailCheckUser: ${emailCheckUser?.email} | update user: ${ownUser.email}`);

            if (!emailCheckUser || emailCheckUser._id.equals(ownUser._id)) {
                const userDetails: Partial<IUser> = {
                    email: email,
                    phone: phone,
                    name: name,
                };
                await UserDao.update(ownUser._id, userDetails, ownUser).then(user => {
                    res.sendSuccess(user, "User updated successfully!");
                }).catch(next);
            } else {
                res.sendError(`User email already exists`, 422);
            }
        } else {
            ErrorLogger.error(`Update user: Illegal attempt`);
            res.sendError(`Illegal attempt!`, 403);
        }
    }
}

export async function update(req: Request, res: Response, next: NextFunction) {
    if (validationsChecker(req, res)) {
        const _id = req.params._id as unknown as Types.ObjectId;
        const {email, phone, name} = req.body;
        const emailCheckUser = await UserDao.getUserByEmail(email);
        const user = await UserDao.getUser(_id);
        const ownUser = req.user as IUser;

        if (ownUser) {
            AppLogger.warn(`emailCheckUser ID: ${emailCheckUser?._id} | update user ID: ${user?._id}`);
            AppLogger.warn(`emailCheckUser: ${emailCheckUser?.email} | update user: ${user?.email}`);

            if (!emailCheckUser || emailCheckUser._id.equals(user._id)) {
                const userDetails: Partial<IUser> = {
                    email: email,
                    phone: phone,
                    name: name,
                };
                await UserDao.update(_id, userDetails, ownUser).then(user => {
                    res.sendSuccess(user, "User updated successfully!");
                }).catch(next);
            } else {
                res.sendError(`User email already exists`, 422);
            }
        } else {
            ErrorLogger.error(`Update user: Illegal attempt`);
            res.sendError(`Illegal attempt!`, 403);
        }
    }
}

export function destroy(req: Request, res: Response, next: NextFunction) {
    if (validationsChecker(req, res)) {
        const user_id = req.params._id as unknown as Types.ObjectId;
        const ownUser = req.user as IUser;
        if (ownUser) {
            UserDao.destroy(user_id, ownUser).then(user => {
                res.sendSuccess(user, "User deleted successfully!");
            }).catch(next);
        } else {
            ErrorLogger.error(`Delete user: Illegal attempt`);
            res.sendError(`Illegal attempt!`, 403);
        }
    }
}

export function deactivate(req: Request, res: Response, next: NextFunction) {
    const ownUser = req.user as IUser;
    if (ownUser) {
        UserDao.deactivate(ownUser._id, ownUser).then(user => {
            res.sendSuccess(user, "User deactivated successfully!");
        }).catch(next);
    } else {
        ErrorLogger.error(`Deactivate user: Illegal attempt`);
        res.sendError(`Illegal attempt!`, 403);
    }
}
