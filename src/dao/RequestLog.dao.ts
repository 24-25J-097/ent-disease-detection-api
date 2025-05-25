import {DRequestLog, IRequestLog, countTodayRequests} from "../models/RequestLog.model";
import {StringOrObjectId} from "../types/util-types";
import {IUser} from "../models/User.model";
import {RequestLog} from "../schemas/RequestLog.schema";
import {AppLogger} from "../utils/logging";
import {ApplicationError} from "../utils/application-error";

export class RequestLogDAO {
    /**
     * Create a new request log entry
     * @param requestData Request log data to create
     * @returns Promise with the created request log
     */
    static async create(requestData: DRequestLog): Promise<IRequestLog> {
        try {
            const newRequestLog = new RequestLog(requestData);
            return await newRequestLog.save();
        } catch (error) {
            if (error instanceof Error) {
                AppLogger.error(`Creating RequestLog: ${error.message}`);
                throw new ApplicationError(`Creating RequestLog: ${error.message}`);
            }
            throw error;
        }
    }

    static async logRequest(
        user: IUser,
        endpoint: string,
        method: string,
        statusCode?: number,
        responseTime?: number,
        userAgent?: string,
        ip?: string
    ): Promise<IRequestLog> {
        try {
            const requestData: DRequestLog = {
                user: user._id,
                endpoint,
                method: method as any,
                statusCode,
                responseTime,
                userAgent,
                ip,
                timestamp: new Date()
            };

            return await this.create(requestData);
        } catch (error) {
            if (error instanceof Error) {
                AppLogger.error(`RequestLog Logging: ${error.message}`);
                throw new ApplicationError(`RequestLog Logging: ${error.message}`);
            }
            throw error;
        }
    }

    /**
     * Count user requests for the current day
     * @param userId User ID to count requests for
     * @returns Promise with the count of requests for today
     */
    static async countTodayRequests(userId: StringOrObjectId): Promise<number> {
        return countTodayRequests(userId);
    }

    /**
     * Get request logs for a user within a date range
     * @param userId User ID
     * @param startDate Start date
     * @param endDate End date
     * @returns Promise with array of request logs
     */
    static async getUserRequestLogs(
        userId: StringOrObjectId,
        startDate: Date,
        endDate: Date
    ): Promise<IRequestLog[]> {
        try {
            return await RequestLog.find({
                user: userId,
                timestamp: {
                    $gte: startDate,
                    $lte: endDate
                }
            }).sort({timestamp: -1});
        } catch (error) {
            if (error instanceof Error) {
                AppLogger.error(`Request Log get user logs: ${error.message}`);
                throw new ApplicationError(`Request Log get user logs: ${error.message}`);
            }
            throw error;
        }
    }

    /**
     * Get request logs grouped by user
     * @param startDate Start date
     * @param endDate End date
     * @returns Promise with aggregation result
     */
    static async getRequestsByUser(startDate: Date, endDate: Date): Promise<any[]> {
        try {
            return await RequestLog.aggregate([
                {
                    $match: {
                        timestamp: {
                            $gte: startDate,
                            $lte: endDate
                        }
                    }
                },
                {
                    $group: {
                        _id: "$user",
                        count: {$sum: 1},
                        endpoints: {$addToSet: "$endpoint"}
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "_id",
                        foreignField: "_id",
                        as: "userDetails"
                    }
                },
                {
                    $unwind: "$userDetails"
                },
                {
                    $project: {
                        _id: 1,
                        count: 1,
                        endpoints: 1,
                        "userDetails.name": 1,
                        "userDetails.email": 1,
                        "userDetails.role": 1
                    }
                },
                {
                    $sort: {count: -1}
                }
            ]);
        } catch (error) {
            if (error instanceof Error) {
                AppLogger.error(`get request log by user: ${error.message}`);
                throw new ApplicationError(`get request log by user: ${error.message}`);
            }
            throw error;
        }
    }

    /**
     * Get request logs grouped by endpoint
     * @param startDate Start date
     * @param endDate End date
     * @returns Promise with aggregation result
     */
    static async getRequestsByEndpoint(startDate: Date, endDate: Date): Promise<any[]> {
        try {
            return await RequestLog.aggregate([
                {
                    $match: {
                        timestamp: {
                            $gte: startDate,
                            $lte: endDate
                        }
                    }
                },
                {
                    $group: {
                        _id: "$endpoint",
                        count: {$sum: 1},
                        methods: {$addToSet: "$method"}
                    }
                },
                {
                    $sort: {count: -1}
                }
            ]);
        } catch (error) {
            if (error instanceof Error) {
                AppLogger.error(`get request by endpoints: ${error.message}`);
                throw new ApplicationError(`get request by endpoints: ${error.message}`);
            }
            throw error;
        }
    }
}