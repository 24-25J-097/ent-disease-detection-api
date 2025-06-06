import * as mongoose from "mongoose";
import {StringOrObjectId} from "../types/util-types";
import {IUser} from "./User.model";
import {IPackage} from "./Package.model";

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface DUserPlan {
    _id?: StringOrObjectId;
    user_id: StringOrObjectId;
    package_id: StringOrObjectId;
    startDate: Date;
    endDate: Date;
    isActive: boolean;
    purchaseDate: Date;
    transactionId?: string;
    paymentMethod?: string;
    paymentStatus: PaymentStatus;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IUserPlan extends mongoose.Document, DUserPlan {
    readonly _id: mongoose.Types.ObjectId;
    user: IUser['_id'] | IUser;
    package: IPackage['_id'] | IPackage;
    usageToday?: number; // Optional property for tracking today's API usage (not stored in DB)
}
