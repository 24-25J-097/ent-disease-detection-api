import {DRoleAccessPolicy, IRoleAccessPolicy, initializeDefaultPolicies} from "../models/RoleAccessPolicy.model";
import {StringOrObjectId} from "../types/util-types";
import createHttpError from "http-errors";
import {Role} from "../enums/auth";
import {RoleAccessPolicy} from "../schemas/RoleAccessPolicy.schema";
import {ApplicationError} from "../utils/application-error";
import {AppLogger} from "../utils/logging";

export class RoleAccessPolicyDAO {
    /**
     * Initialize default policies if they don't exist
     * @returns Promise that resolves when initialization is complete
     */
    static async initialize(): Promise<void> {
        await initializeDefaultPolicies();
    }

    /**
     * Get all role access policies
     * @returns Promise with array of role access policies
     */
    static async getAll(): Promise<IRoleAccessPolicy[]> {
        try {
            return await RoleAccessPolicy.find().sort({role: 1});
        } catch (error) {
            if (error instanceof Error) {
                AppLogger.error(`Get Role access policies: ${error.message}`);
                throw new ApplicationError(`Get Role access policies: ${error.message}`);
            }
            throw error;
        }
    }

    /**
     * Get role access policy by role
     * @param role Role to get policy for
     * @returns Promise with the role access policy or null if not found
     */
    static async getByRole(role: Role): Promise<IRoleAccessPolicy | null> {
        try {
            return await RoleAccessPolicy.findOne({role});
        } catch (error) {
            if (error instanceof Error) {
                AppLogger.error(`Get policies by role: ${error.message}`);
                throw new ApplicationError(`Get policies by role: ${error.message}`);
            }
            throw error;
        }
    }

    /**
     * Update role access policy
     * @param role Role to update policy for
     * @param policyData Updated policy data
     * @returns Promise with the updated policy
     */
    static async update(role: Role, policyData: Partial<DRoleAccessPolicy>): Promise<IRoleAccessPolicy | null> {
        try {
            // Ensure role cannot be changed
            if (policyData.role && policyData.role !== role) {
                throw createHttpError(400, "Role cannot be changed");
            }

            return await RoleAccessPolicy.findOneAndUpdate(
                {role},
                {...policyData, updatedAt: new Date()},
                {new: true, runValidators: true}
            );
        } catch (error) {
            if (error instanceof Error) {
                AppLogger.error(`Update Role policy: ${error.message}`);
                throw new ApplicationError(`Update Role policy: ${error.message}`);
            }
            throw error;
        }
    }

    /**
     * Check if a role has unlimited access
     * @param role Role to check
     * @returns Promise with boolean indicating if role has unlimited access
     */
    static async hasUnlimitedAccess(role: Role): Promise<boolean> {
        try {
            const policy = await RoleAccessPolicy.findOne({role});
            return policy ? policy.hasUnlimitedAccess : false;
        } catch (error) {
            if (error instanceof Error) {
                AppLogger.error(`Role unlimited Access: ${error.message}`);
                throw new ApplicationError(`Role unlimited Access: ${error.message}`);
            }
            throw error;
        }
    }

    /**
     * Check if a role requires a package
     * @param role Role to check
     * @returns Promise with boolean indicating if role requires a package
     */
    static async requiresPackage(role: Role): Promise<boolean> {
        try {
            const policy = await RoleAccessPolicy.findOne({role});
            return policy ? policy.requiresPackage : true; // Default to requiring package if policy not found
        } catch (error) {
            if (error instanceof Error) {
                AppLogger.error(`Is Role Requires Package Dao: ${error.message}`);
                throw new ApplicationError(`Is Role Requires Package Dao: ${error.message}`);
            }
            throw error;
        }
    }

    /**
     * Reset all policies to default values
     * @returns Promise with the number of policies reset
     */
    static async resetToDefaults(): Promise<number> {
        try {
            // Delete all existing policies
            await RoleAccessPolicy.deleteMany({});

            // Initialize default policies
            await initializeDefaultPolicies();

            // Count the number of policies created
            return await RoleAccessPolicy.countDocuments();
        } catch (error) {
            if (error instanceof Error) {
                AppLogger.error(`Role Policy Reset Default: ${error.message}`);
                throw new ApplicationError(`Role Policy Reset Default: ${error.message}`);
            }
            throw error;
        }
    }
}