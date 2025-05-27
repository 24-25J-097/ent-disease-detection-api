import * as mongoose from "mongoose";
import {StringOrObjectId} from "../types/util-types";

export interface DPackage {
    _id?: StringOrObjectId;
    name: string;
    dailyRequestLimit: number;
    durationInDays: number;
    price: number;
    isUnlimited: boolean;
    description?: string;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IPackage extends mongoose.Document, DPackage {
    readonly _id: mongoose.Types.ObjectId;
}
