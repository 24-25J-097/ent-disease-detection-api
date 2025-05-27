import { NextFunction, Request, Response } from "express";
import { IUser } from "../models/User.model";
import { RoleAccessPolicyDAO } from "../dao/RoleAccessPolicy.dao";
import { UserPlanDAO } from "../dao/UserPlan.dao";
import { RequestLogDAO } from "../dao/RequestLog.dao";
import createHttpError from "http-errors";
import { AppLogger } from "../utils/logging";

/**
 * Middleware to control API access based on user role and package
 * Checks if:
 * 1. User has unlimited access based on role
 * 2. User has a valid package if required by their role
 * 3. User has not exceeded their daily request limit
 */
export async function apiAccessControl(req: Request, res: Response, next: NextFunction) {
    try {
        const user = req.user as IUser;
        
        if (!user || !user._id) {
            return next(createHttpError(401, "Unauthorized: User not authenticated"));
        }

        const role = user.role;
        const startTime = Date.now();
        
        // Check if role has unlimited access
        const hasUnlimitedAccess = await RoleAccessPolicyDAO.hasUnlimitedAccess(role);
        
        if (hasUnlimitedAccess) {
            // Log the request but don't check limits
            logRequestAfterResponse(req, res, user, startTime);
            return next();
        }
        
        // Check if role requires a package
        const requiresPackage = await RoleAccessPolicyDAO.requiresPackage(role);
        
        if (!requiresPackage) {
            // Role doesn't require a package, allow access
            logRequestAfterResponse(req, res, user, startTime);
            return next();
        }
        
        // Get active user plan
        const activePlan = await UserPlanDAO.getActiveUserPlan(user._id);
        
        if (!activePlan) {
            return next(createHttpError(402, "Payment Required: No active package found"));
        }
        
        // Check if plan is unlimited
        if (activePlan.package && typeof activePlan.package === 'object' && 'isUnlimited' in activePlan.package && activePlan.package.isUnlimited) {
            logRequestAfterResponse(req, res, user, startTime);
            return next();
        }
        
        // Count today's requests
        const todayRequestCount = await RequestLogDAO.countTodayRequests(user._id);
        
        // Get daily request limit from the package
        const dailyRequestLimit = activePlan.package && typeof activePlan.package === 'object' && 'dailyRequestLimit' in activePlan.package
            ? activePlan.package.dailyRequestLimit 
            : 0;
        
        // Check if user has exceeded their daily request limit
        if (todayRequestCount >= dailyRequestLimit) {
            return next(createHttpError(429, "Too Many Requests: Daily request limit exceeded"));
        }
        
        // Allow access and log the request
        logRequestAfterResponse(req, res, user, startTime);
        next();
    } catch (error) {
        AppLogger.error(`API Access Control Error: ${error}`);
        next(error);
    }
}

/**
 * Log the request after the response is sent
 */
function logRequestAfterResponse(req: Request, res: Response, user: IUser, startTime: number) {
    res.on('finish', async () => {
        try {
            const responseTime = Date.now() - startTime;
            
            await RequestLogDAO.logRequest(
                user,
                req.originalUrl,
                req.method,
                res.statusCode,
                responseTime,
                req.headers['user-agent'],
                req.ip
            );
        } catch (error) {
            AppLogger.error(`Request Logging Error: ${error}`);
        }
    });
}