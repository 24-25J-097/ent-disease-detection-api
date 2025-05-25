import {DUserPlan, IUserPlan} from "../models/UserPlan.model";
import {StringOrObjectId} from "../types/util-types";
import createHttpError from "http-errors";
import {Package} from "../schemas/Package.schema";
import {UserPlan} from "../schemas/UserPlan.schema";
import {AppLogger} from "../utils/logging";
import {ApplicationError} from "../utils/application-error";

export class UserPlanDAO {
    /**
     * Create a new user plan (subscription)
     * @param userPlanData User plan data to create
     * @returns Promise with the created user plan
     */
    static async create(userPlanData: DUserPlan): Promise<IUserPlan> {
        try {
            // Check if package exists
            const packageExists = await Package.exists({_id: userPlanData.package});
            if (!packageExists) {
                throw createHttpError(404, `Package with ID '${userPlanData.package}' not found`);
            }

            // Deactivate any active plans for this user
            await UserPlan.updateMany(
                {user: userPlanData.user, isActive: true},
                {isActive: false, updatedAt: new Date()}
            );

            const newUserPlan = new UserPlan(userPlanData);
            return await newUserPlan.save();
        } catch (error) {
            if (error instanceof Error) {
                AppLogger.error(`Creating User Plan: ${error.message}`);
                throw new ApplicationError(`Creating User Plan: ${error.message}`);
            }
            throw error;
        }
    }

    /**
     * Get all user plans
     * @param activeOnly If true, only return active plans
     * @returns Promise with array of user plans
     */
    static async getAll(activeOnly = false): Promise<IUserPlan[]> {
        try {
            const query = activeOnly ? {isActive: true} : {};
            return await UserPlan.find(query)
                .populate('user', 'name email role')
                .populate('package', 'name dailyRequestLimit durationInDays price isUnlimited')
                .sort({createdAt: -1});
        } catch (error) {
            if (error instanceof Error) {
                AppLogger.error(`Get all user plan Package: ${error.message}`);
                throw new ApplicationError(`Get all user plan Package: ${error.message}`);
            }
            throw error;
        }
    }

    /**
     * Get user plans by user ID
     * @param userId User ID
     * @param activeOnly If true, only return active plans
     * @returns Promise with array of user plans
     */
    static async getByUserId(userId: StringOrObjectId, activeOnly = false): Promise<IUserPlan[]> {
        try {
            const query: any = {user: userId};
            if (activeOnly) {
                query.isActive = true;
            }

            return await UserPlan.find(query)
                .populate('package', 'name dailyRequestLimit durationInDays price isUnlimited')
                .sort({createdAt: -1});
        } catch (error) {
            if (error instanceof Error) {
                AppLogger.error(`Get UserPlan Package by user: ${error.message}`);
                throw new ApplicationError(`Get UserPlan Package by user: ${error.message}`);
            }
            throw error;
        }
    }

    /**
     * Get user plan by ID
     * @param id User plan ID
     * @returns Promise with the user plan or null if not found
     */
    static async getById(id: StringOrObjectId): Promise<IUserPlan | null> {
        try {
            return await UserPlan.findById(id)
                .populate('user', 'name email role')
                .populate('package', 'name dailyRequestLimit durationInDays price isUnlimited');
        } catch (error) {
            if (error instanceof Error) {
                AppLogger.error(`Get User Plan by id: ${error.message}`);
                throw new ApplicationError(`Get User Plan by id: ${error.message}`);
            }
            throw error;
        }
    }

    /**
     * Get active user plan for a user
     * @param userId User ID
     * @returns Promise with the active user plan or null if not found
     */
    static async getActiveUserPlan(userId: StringOrObjectId): Promise<IUserPlan | null> {
        try {
            const now = new Date();

            return await UserPlan.findOne({
                user: userId,
                isActive: true,
                startDate: {$lte: now},
                endDate: {$gte: now}
            }).populate('package', 'name dailyRequestLimit durationInDays price isUnlimited');
        } catch (error) {
            if (error instanceof Error) {
                AppLogger.error(`Get Active user plans: ${error.message}`);
                throw new ApplicationError(`Get Active user plans: ${error.message}`);
            }
            throw error;
        }
    }

    /**
     * Update user plan
     * @param id User plan ID
     * @param userPlanData Updated user plan data
     * @returns Promise with the updated user plan
     */
    static async update(id: StringOrObjectId, userPlanData: Partial<DUserPlan>): Promise<IUserPlan | null> {
        try {
            // If changing package, check if it exists
            if (userPlanData.package) {
                const packageExists = await Package.exists({_id: userPlanData.package});
                if (!packageExists) {
                    throw createHttpError(404, `Package with ID '${userPlanData.package}' not found`);
                }
            }

            return await UserPlan.findByIdAndUpdate(
                id,
                {...userPlanData, updatedAt: new Date()},
                {new: true, runValidators: true}
            ).populate('package', 'name dailyRequestLimit durationInDays price isUnlimited');
        } catch (error) {
            if (error instanceof Error) {
                AppLogger.error(`Update User plan: ${error.message}`);
                throw new ApplicationError(`Update User plan: ${error.message}`);
            }
            throw error;
        }
    }

    /**
     * Cancel user plan (deactivate)
     * @param id User plan ID
     * @returns Promise with the updated user plan
     */
    static async cancel(id: StringOrObjectId): Promise<IUserPlan | null> {
        try {
            return await UserPlan.findByIdAndUpdate(
                id,
                {isActive: false, updatedAt: new Date()},
                {new: true}
            );
        } catch (error) {
            if (error instanceof Error) {
                AppLogger.error(`Cancel User plan: ${error.message}`);
                throw new ApplicationError(`Cancel User plan: ${error.message}`);
            }
            throw error;
        }
    }

    /**
     * Get expired plans (plans that have ended but are still marked as active)
     * @returns Promise with array of expired plans
     */
    static async getExpiredPlans(): Promise<IUserPlan[]> {
        try {
            const now = new Date();

            return await UserPlan.find({
                isActive: true,
                endDate: {$lt: now}
            }).populate('user', 'name email role')
                .populate('package', 'name');
        } catch (error) {
            if (error instanceof Error) {
                AppLogger.error(`Get expired user plans: ${error.message}`);
                throw new ApplicationError(`Get expired user plans: ${error.message}`);
            }
            throw error;
        }
    }

    /**
     * Deactivate expired plans
     * @returns Promise with the number of plans deactivated
     */
    static async deactivateExpiredPlans(): Promise<number> {
        try {
            const now = new Date();

            const result = await UserPlan.updateMany(
                {isActive: true, endDate: {$lt: now}},
                {isActive: false, updatedAt: new Date()}
            );

            return result.modifiedCount;
        } catch (error) {
            if (error instanceof Error) {
                AppLogger.error(`Deactivate Expired plans: ${error.message}`);
                throw new ApplicationError(`Deactivate Expired plans: ${error.message}`);
            }
            throw error;
        }
    }
}