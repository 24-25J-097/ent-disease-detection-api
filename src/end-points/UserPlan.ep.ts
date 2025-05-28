import {Request, Response} from "express";
import {UserPlanDAO} from "../dao/UserPlan.dao";
import {PackageDAO} from "../dao/Package.dao";
import {AppLogger} from "../utils/logging";
import createHttpError from "http-errors";
import {IUser} from "../models/User.model";
import {PaymentStatus} from "../models/UserPlan.model";


/**
 * Create a new user plan (subscription)
 * @route POST /api/admin/user-plans
 */
export async function createUserPlan(req: Request, res: Response) {
    try {
        const planData = req.body;
        // Validate required fields
        if (!planData.user_id || !planData.package || !planData.endDate) {
            throw createHttpError(400, "Missing required fields");
        }

        // Check if package exists
        const packageExists = await PackageDAO.getById(planData.package);
        if (!packageExists) {
            throw createHttpError(404, `Package with ID '${planData.package}' not found`);
        }

        // Calculate end date if not provided
        if (!planData.endDate && packageExists.durationInDays) {
            const startDate = planData.startDate ? new Date(planData.startDate) : new Date();
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + packageExists.durationInDays);
            planData.endDate = endDate;
        }

        const newUserPlan = await UserPlanDAO.create(planData);

        AppLogger.info(`User plan created for user: ${planData.user_id}`);
        res.sendSuccess(newUserPlan);
    } catch (error: any) {
        AppLogger.error(`Create user plan error: ${error.message}`);

        res.sendError(error.message || "Error creating user plan", error.status || 500);
    }
}

/**
 * Purchase a package (for authenticated users)
 * @route POST /api/auth/purchase-package
 */
export async function purchasePackage(req: Request, res: Response) {
    try {
        const {packageId, paymentMethod, transactionId} = req.body;
        const user = req.user as IUser;

        if (!packageId) {
            throw createHttpError(422, "Package ID is required");
        }

        // Check if package exists and is active
        const packageData = await PackageDAO.getById(packageId);
        if (!packageData) {
            throw createHttpError(404, "Package not found");
        }

        if (!packageData.isActive) {
            throw createHttpError(422, "This package is not currently available");
        }

        const activePlan = await UserPlanDAO.getActiveUserPlan(user._id);
        if (activePlan) {
            throw createHttpError(422, "You already have an active plan");
        }
        // Create user plan
        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + packageData.durationInDays);

        const planData = {
            user_id: user._id,
            package_id: packageId,
            startDate,
            endDate,
            isActive: true,
            purchaseDate: new Date(),
            paymentMethod: paymentMethod || 'credit_card',
            transactionId: transactionId || `txn_${Date.now()}`,
            paymentStatus: "completed" as PaymentStatus
        };

        const newUserPlan = await UserPlanDAO.create(planData);

        AppLogger.info(`Package purchased by user: ${user._id}`);
        res.sendSuccess(newUserPlan, "You have successfully purchased a package. Your plan will be activated shortly. Thank you for your business!", 201);
    } catch (error: any) {
        AppLogger.error(`Purchase package error: ${error.message}`);

        res.sendError(error.message || "Error purchasing package", error.status || 500);
    }
}

/**
 * Get all user plans (admin only)
 * @route GET /api/admin/user-plans
 */
export async function getAllUserPlans(req: Request, res: Response) {
    try {
        const activeOnly = req.query.active === 'true';
        const userPlans = await UserPlanDAO.getAll(activeOnly);

        res.sendSuccess(userPlans);
    } catch (error: any) {
        AppLogger.error(`Get user plans error: ${error.message}`);
        res.sendError(error.message || "Error retrieving user plans", error.status || 500);
    }
}

/**
 * Get user plans for a specific user
 * @route GET /api/admin/user-plans/user/:userId
 * @route GET /api/auth/my-plans (for current user)
 */
export async function getUserPlans(req: Request, res: Response) {
    try {
        let userId;

        // If this is the /my-plans route, use the authenticated user's ID
        if (req.originalUrl.includes('admin/purchased-plans/user/')) {
            userId = req.params.userId;
        } else {
            const user = req.user as IUser;
            userId = user._id;
        }

        const activeOnly = req.query.active === 'true';
        const userPlans = await UserPlanDAO.getByUserId(userId, activeOnly);

        res.sendSuccess({
            count: userPlans.length,
            data: userPlans
        });
    } catch (error: any) {
        AppLogger.error(`Get user plans error: ${error.message}`);
        res.sendError(error.message || "Error retrieving user plans", error.status || 500);
    }
}

/**
 * Get user plan by ID
 * @route GET /api/admin/user-plans/:id
 */
export async function getUserPlanById(req: Request, res: Response) {
    try {
        const planId = req.params.id;
        const userPlan = await UserPlanDAO.getById(planId);

        if (!userPlan) {
            throw createHttpError(404, "User plan not found");
        }

        res.sendSuccess(userPlan);
    } catch (error: any) {
        AppLogger.error(`Get user plan error: ${error.message}`);
        res.sendError(error.message || "Error retrieving user plan", 500);
    }
}

/**
 * Get active plan for current user
 * @route GET /api/auth/active-plan
 */
export async function getActivePlan(req: Request, res: Response) {
    try {
        const user = req.user as IUser;
        const activePlan = await UserPlanDAO.getActiveUserPlan(user._id);

        res.sendSuccess(activePlan);
    } catch (error: any) {
        AppLogger.error(`Get active plan error: ${error.message}`);
        res.sendError(error.message || "Error retrieving active plan", error.status || 500);
    }
}

/**
 * Update user plan (admin only)
 * @route PUT /api/admin/user-plans/:id
 */
export async function updateUserPlan(req: Request, res: Response) {
    try {
        const planId = req.params.id;
        const planData = req.body;

        const updatedPlan = await UserPlanDAO.update(planId, planData);

        if (!updatedPlan) {
            throw createHttpError(404, "User plan not found");
        }

        AppLogger.info(`User plan updated: ${planId}`);
        res.sendSuccess(updatedPlan);
    } catch (error: any) {
        AppLogger.error(`Update user plan error: ${error.message}`);
        res.sendError(error.message || "Error updating user plan", error.status || 500);
    }
}

/**
 * Cancel user plan
 * @route DELETE /api/admin/user-plans/:id
 * @route DELETE /api/auth/cancel-plan/:id (for current user)
 */
export async function cancelUserPlan(req: Request, res: Response) {
    try {
        const planId = req.params.id;

        // If this is the user route, verify the plan belongs to the user
        if (req.originalUrl.includes('/auth/cancel-plan')) {
            const user = req.user as IUser;
            const plan = await UserPlanDAO.getById(planId);

            if (!plan) {
                throw createHttpError(404, "User plan not found");
            }

            if (plan.user_id.toString() !== user._id.toString()) {
                throw createHttpError(403, "You can only cancel your own plans");
            }
        }

        const cancelledPlan = await UserPlanDAO.cancel(planId);

        if (!cancelledPlan) {
            throw createHttpError(404, "User plan not found");
        }

        AppLogger.info(`User plan cancelled: ${planId}`);
        res.sendSuccess(null, "Plan cancelled successfully");
    } catch (error: any) {
        AppLogger.error(`Cancel user plan error: ${error.message}`);

        res.sendError(error.message || "Error cancelling user plan\"", error.status || 500);
    }
}

/**
 * Get expired plans (admin only)
 * @route GET /api/admin/user-plans/expired
 */
export async function getExpiredPlans(req: Request, res: Response) {
    try {
        const expiredPlans = await UserPlanDAO.getExpiredPlans();

        res.sendSuccess({
            count: expiredPlans.length,
            data: expiredPlans
        });
    } catch (error: any) {
        AppLogger.error(`Get expired plans error: ${error.message}`);

        res.sendError(error.message || "Error retrieving expired plans", error.status || 500);
    }
}

/**
 * Deactivate expired plans (admin only)
 * @route POST /api/admin/user-plans/deactivate-expired
 */
export async function deactivateExpiredPlans(req: Request, res: Response) {
    try {
        const count = await UserPlanDAO.deactivateExpiredPlans();

        AppLogger.info(`Deactivated ${count} expired plans`);
        res.sendSuccess(null, `Deactivated ${count} expired plans`);
    } catch (error: any) {
        AppLogger.error(`Deactivate expired plans error: ${error.message}`);

        res.sendError(error.message || "Error deactivating expired plans", error.status || 500);
    }
}