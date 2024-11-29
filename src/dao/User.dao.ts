import {PopulateOptions, Types} from "mongoose";
import {Role, SignedUpAs} from "../enums/auth";
import {IUser} from "../models/User.model";
import User from "../schemas/User.schema";
import {AuthUserData} from "../types/util-types";
import {ApplicationError} from "../utils/application-error";
import {AppLogger} from "../utils/logging";

const commonPopulates: PopulateOptions[] = [{path: "photo"}];
const adminPopulates = [...commonPopulates];
const doctorPopulates = [...commonPopulates];
const radiologistPopulates = [...commonPopulates];
const studentPopulates = [...commonPopulates];

function getPopulatesForRole(role: Role): PopulateOptions[] {
    switch (role) {
        case Role.ADMIN:
            return adminPopulates;
        case Role.DOCTOR:
            return doctorPopulates;
        case Role.RADIOLOGIST:
            return radiologistPopulates;
        case Role.STUDENT:
            return studentPopulates;
        default:
            return commonPopulates;
    }
}

export async function authenticateUser(email: string, password: string, signedUpAs: string | undefined, tokenValidityTime: string): Promise<AuthUserData> {
    if (signedUpAs === SignedUpAs.EMAIL) {
        const user = await User.findOne({email: email});
        if (user) {
            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                AppLogger.error(`User logging failed, Incorrect credentials: ${email}`);
                throw new ApplicationError('Incorrect email/password combination! 123', 401);
            }
            AppLogger.info(`User logged in as ${signedUpAs} ID: ${user._id}`);
            const token = user.createAccessToken(tokenValidityTime);
            return {token: token, user: user};
        } else {
            AppLogger.error(`User logging failed, Not found with: ${email}`);
            throw new ApplicationError('User is not found in the system!', 404);
        }
    }
    else if (signedUpAs === SignedUpAs.FACEBOOK) {
        // TODO: facebook
        AppLogger.info(`User tried to login by ${signedUpAs}`);
        throw new ApplicationError('Please login with email for now!', 400);
    }
    else if (signedUpAs === SignedUpAs.GOOGLE) {
        // TODO: google
        AppLogger.info(`User tried to login by ${signedUpAs}`);
        throw new ApplicationError('Please login with email for now!', 400);
    } else {
        throw new ApplicationError('Unsupported sign-up method!', 400);
    }
}

export async function getAllUsers(ownUser: IUser): Promise<IUser[]> {
    const users = await User.find();
    if (users) {
        AppLogger.info(`Got All Users - Count: ${users.length} by ${Role.getTitle(ownUser.role)} (ID: ${ownUser._id})`);
        return users;
    } else {
        AppLogger.error(`Get all users: Not Found`);
        throw new ApplicationError(`Get all users: Users not found!`, 404);
    }
}

export async function getUser(id: Types.ObjectId): Promise<IUser> {
    const user = await User.findById(id).populate(commonPopulates);
    if (!user) {
        throw new ApplicationError("User is not found for ID: " + id, 404);
    }
    AppLogger.info(`Got user for id, userID: ${user._id}`);
    user.lastLoggedIn = new Date();
    await user.save();
    const populates = getPopulatesForRole(user.role);
    // await user.populate(populates).execPopulate();
    await user.populate(populates);
    return user;
}

export async function getUserByEmail(email: string): Promise<IUser | null> {
    const user = await User.findOne({email}).populate(commonPopulates);
    AppLogger.info(`Got user for id, userID: ${user ? user._id : null}`);
    if (user) {
        const populates = getPopulatesForRole(user.role);
        // return user.populate(populates).execPopulate();
        return user.populate(populates);
    } else {
        return null;
    }
}

export async function update(userId: Types.ObjectId, userDetails: Partial<IUser>, ownUser: IUser): Promise<IUser> {
    const updatedUser = await User.findByIdAndUpdate(userId, userDetails, {new: true});
    if (updatedUser) {
        AppLogger.info(`Updated user (ID: ${updatedUser._id}) by ${Role.getTitle(ownUser.role)} (ID: ${ownUser?._id})`);
        return updatedUser;
    } else {
        AppLogger.error(`Update user: Not found user (ID: ${userId})`);
        throw new ApplicationError(`Update user: User not found for ID: ${userId} !`, 404);
    }
}

export async function destroy(userId: Types.ObjectId, ownUser: IUser): Promise<IUser> {
    if (ownUser._id === userId) {
        AppLogger.error(`Delete user: cannot delete logged user (ID: ${userId})`);
        throw new ApplicationError(`Delete user: Cannot Delete user ID: ${userId} !`, 400);
    }

    const selectedUser = await User.findById(userId);
    if (selectedUser) {
        if (selectedUser?.role.toString() === Role.ADMIN) {
            AppLogger.error(`Delete user: cannot delete admin users (ID: ${userId})`);
            throw new ApplicationError(`Delete user: Cannot Delete admin user for ID: ${userId} !`, 400);
        }

        const deleted = await User.findOneAndDelete({_id: userId});

        if (deleted) {
            AppLogger.info(`Deleted user (ID: ${selectedUser._id}) by ${Role.getTitle(ownUser.role)} (ID: ${ownUser._id})`);
            return selectedUser;
        }
    }
    AppLogger.error(`Delete user: Not found user (ID: ${userId})`);
    throw new ApplicationError(`Delete user: User not found for ID: ${userId} !`, 404);
}

export async function deactivate(userId: Types.ObjectId, ownUser: IUser): Promise<IUser> {
    const selectedUser = await User.findById(userId);
    if (selectedUser) {
        if (selectedUser?.role.toString() === Role.ADMIN) {
            AppLogger.error(`Deactivate user: cannot deactivate admin users (ID: ${userId})`);
            throw new ApplicationError(`Deactivate user: Cannot Deactivate admin user for ID: ${userId} !`, 400);
        }

        const reason = {
            reason: "Self Deactivation",
            deactivatedAt: new Date(),
            deactivatedBy: ownUser._id,
        };
        if (!selectedUser.deactivateReasons) {
            selectedUser.deactivateReasons = [reason];
        } else {
            selectedUser.deactivateReasons?.push(reason);
        }
        selectedUser.isActive = false;
        await selectedUser.save();

        AppLogger.info(`Deactivated user (ID: ${selectedUser._id}) by ${Role.getTitle(ownUser.role)} (ID: ${ownUser._id})`);
        return selectedUser;
    }

    AppLogger.error(`Deactivate user: User not found (ID: ${userId})`);
    throw new ApplicationError(`Deactivate user: User not found for ID: ${userId} !`, 404);
}

