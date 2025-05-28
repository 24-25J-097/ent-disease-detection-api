import {Request, Response} from "express";
import {RequestLogDAO} from "../dao/RequestLog.dao";
import {AppLogger} from "../utils/logging";
import {UserPlan} from "../schemas/UserPlan.schema";
import {RequestLog} from "../schemas/RequestLog.schema";


/**
 * Get API usage report grouped by user
 * @route GET /api/admin/reports/api-usage/by-user
 */
export async function getApiUsageByUser(req: Request, res: Response) {
    try {
        // Parse date range from query parameters
        const {startDate, endDate} = parseReportDateRange(req);

        const usageData = await RequestLogDAO.getRequestsByUser(startDate, endDate);

        res.sendSuccess(usageData);
    } catch (error: any) {
        AppLogger.error(`API usage report error: ${error.message}`);
        res.sendError(error.message || "Error generating API usage report", error.status || 500);
    }
}

/**
 * Get API usage report grouped by endpoint
 * @route GET /api/admin/reports/api-usage/by-endpoint
 */
export async function getApiUsageByEndpoint(req: Request, res: Response) {
    try {
        // Parse date range from query parameters
        const {startDate, endDate} = parseReportDateRange(req);

        const usageData = await RequestLogDAO.getRequestsByEndpoint(startDate, endDate);

        res.sendSuccess({
            count: usageData.length,
            dateRange: {startDate, endDate},
            data: usageData
        });
    } catch (error: any) {
        AppLogger.error(`API usage report error: ${error.message}`);
        res.sendError(error.message || "Error generating API usage report", error.status || 500);
    }
}

/**
 * Get purchase history report
 * @route GET /api/admin/reports/purchase-history
 */
export async function getPurchaseHistory(req: Request, res: Response) {
    try {
        // Parse date range from query parameters
        const {startDate, endDate} = parseReportDateRange(req);

        // Get all user plans within the date range
        const userPlans = await UserPlan.aggregate([
            {
                $match: {
                    purchaseDate: {
                        $gte: startDate,
                        $lte: endDate
                    }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "user",
                    foreignField: "_id",
                    as: "userDetails"
                }
            },
            {
                $unwind: "$userDetails"
            },
            {
                $lookup: {
                    from: "packages",
                    localField: "package",
                    foreignField: "_id",
                    as: "packageDetails"
                }
            },
            {
                $unwind: "$packageDetails"
            },
            {
                $project: {
                    _id: 1,
                    purchaseDate: 1,
                    startDate: 1,
                    endDate: 1,
                    paymentMethod: 1,
                    paymentStatus: 1,
                    transactionId: 1,
                    "userDetails.name": 1,
                    "userDetails.email": 1,
                    "userDetails.role": 1,
                    "packageDetails.name": 1,
                    "packageDetails.price": 1
                }
            },
            {
                $sort: {purchaseDate: -1}
            }
        ]);

        res.sendSuccess(userPlans);
    } catch (error: any) {
        AppLogger.error(`Purchase history report error: ${error.message}`);
        res.sendError(error.message || "Error generating API purchase history report", error.status || 500);
    }
}

/**
 * Get active vs expired user packages report
 * @route GET /api/admin/reports/user-plans/status
 */
export async function getUserPlanStatus(req: Request, res: Response) {
    try {
        const now = new Date();

        // Get counts of active and expired plans
        const activePlans = await UserPlan.countDocuments({
            isActive: true,
            endDate: {$gte: now}
        });

        const expiredActivePlans = await UserPlan.countDocuments({
            isActive: true,
            endDate: {$lt: now}
        });

        const inactivePlans = await UserPlan.countDocuments({
            isActive: false
        });

        // Get plans expiring soon (within the next 7 days)
        const nextWeek = new Date(now);
        nextWeek.setDate(nextWeek.getDate() + 7);

        const expiringSoon = await UserPlan.find({
            isActive: true,
            endDate: {
                $gte: now,
                $lte: nextWeek
            }
        }).populate('user', 'user_id name email role')
            .populate('package', 'package_id name');

        res.sendSuccess({
            summary: {
                activePlans,
                expiredActivePlans,
                inactivePlans,
                totalPlans: activePlans + expiredActivePlans + inactivePlans,
                expiringSoonCount: expiringSoon.length
            },
            expiringSoon
        });
    } catch (error: any) {
        AppLogger.error(`User plan status report error: ${error.message}`);
        res.sendError(error.message || "Error generating user plan status report", error.status || 500);
    }
}

/**
 * Get user API usage details for a specific user
 * @route GET /api/admin/reports/user/:userId/api-usage
 */
export async function getUserApiUsage(req: Request, res: Response) {
    try {
        const userId = req.params.userId;

        // Parse date range from query parameters
        const {startDate, endDate} = parseReportDateRange(req);

        const userLogs = await RequestLogDAO.getUserRequestLogs(userId, startDate, endDate);

        // Group by day
        const dailyUsage = userLogs.reduce((acc: any, log) => {
            const date = new Date(log.timestamp).toISOString().split('T')[0];

            if (!acc[date]) {
                acc[date] = {
                    date,
                    count: 0,
                    endpoints: {}
                };
            }

            acc[date].count++;

            if (!acc[date].endpoints[log.endpoint]) {
                acc[date].endpoints[log.endpoint] = 0;
            }

            acc[date].endpoints[log.endpoint]++;

            return acc;
        }, {});

        const dailyUsageArray = Object.values(dailyUsage);

        res.sendSuccess({
            userId,
            dateRange: {startDate, endDate},
            totalRequests: userLogs.length,
            dailyUsage: dailyUsageArray
        });
    } catch (error: any) {
        AppLogger.error(`User API usage report error: ${error.message}`);

        res.sendError(error.message || "Error generating user API usage report", error.status || 500);
    }
}

/**
 * Get all API usage data within a date range
 * @route GET /api/admin/reports/plans/api-usage
 */
export async function getAllUsage(req: Request, res: Response) {
    try {
        // Parse date range from query parameters
        const {startDate, endDate} = parseReportDateRange(req);

        // Get all request logs within the date range
        const logs = await RequestLog.find({
            timestamp: {
                $gte: startDate,
                $lte: endDate
            }
        }).populate('user', 'name email role')
          .sort({timestamp: -1});

        // Group by day for summary
        const dailySummary = logs.reduce((acc: any, log) => {
            const date = new Date(log.timestamp).toISOString().split('T')[0];

            if (!acc[date]) {
                acc[date] = {
                    date,
                    count: 0
                };
            }

            acc[date].count++;
            return acc;
        }, {});

        const dailySummaryArray = Object.values(dailySummary);

        res.sendSuccess({
            dateRange: {startDate, endDate},
            totalRequests: logs.length,
            dailySummary: dailySummaryArray,
            data: logs
        });
    } catch (error: any) {
        AppLogger.error(`Get all API usage error: ${error.message}`);
        res.sendError(error.message || "Error retrieving API usage data", error.status || 500);
    }
}


/**
 * Parse date range from request query parameters
 * @param req Express request
 * @returns Object with startDate and endDate
 */
function parseReportDateRange(req: Request): { startDate: Date, endDate: Date } {
    // Default to last 30 days if not specified
    const endDate = req.query.endDate
        ? new Date(req.query.endDate as string)
        : new Date();

    const startDate = req.query.startDate
        ? new Date(req.query.startDate as string)
        : new Date(endDate);

    // If only startDate is provided, default endDate to today
    // If only endDate is provided, default startDate to 30 days before endDate
    if (req.query.startDate && !req.query.endDate) {
        // Do nothing, endDate is already set to today
    } else if (!req.query.startDate && req.query.endDate) {
        startDate.setDate(endDate.getDate() - 30);
    } else if (!req.query.startDate && !req.query.endDate) {
        // Default to last 30 days
        startDate.setDate(endDate.getDate() - 30);
    }

    // Set time to start and end of day
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    return {startDate, endDate};
}
