import * as mongoose from "mongoose";
import {StringOrObjectId} from "../types/util-types";
import {RequestLog} from "../schemas/RequestLog.schema";
import {IUser} from "./User.model";

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface DRequestLog {
    _id?: StringOrObjectId;
    user: StringOrObjectId;
    endpoint: string;
    method: HttpMethod;
    statusCode?: number;
    responseTime?: number;
    userAgent?: string;
    ip?: string;
    timestamp: Date;
}

export interface IRequestLog extends mongoose.Document, DRequestLog {
    readonly _id: mongoose.Types.ObjectId;
    user: IUser['_id'] | IUser;
}


/**
 * Count user requests for the current day
 * @param userId User ID to count requests for
 * @returns Promise with the count of requests for today
 */
export async function countTodayRequests(userId: StringOrObjectId): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return RequestLog.countDocuments({
        user: userId,
        timestamp: {
            $gte: today,
            $lt: tomorrow
        }
    });
}