import {Request, Response} from "express";
import {RoleAccessPolicyDAO} from "../dao/RoleAccessPolicy.dao";
import {AppLogger} from "../utils/logging";
import createHttpError from "http-errors";
import {Role} from "../enums/auth";


/**
 * Initialize default role access policies
 * @route POST /api/admin/role-policies/initialize
 */
export async function initializePolicies(req: Request, res: Response) {
    try {
        await RoleAccessPolicyDAO.initialize();

        AppLogger.info("Role access policies initialized");
        res.sendSuccess(null, "Role access policies initialized successfully");
    } catch (error: any) {
        AppLogger.error(`Initialize policies error: ${error.message}`);
        res.sendError(error.message || "Error initializing role access policies", error.status || 500);
    }
}

/**
 * Get all role access policies
 * @route GET /api/admin/role-policies
 */
export async function getAllPolicies(req: Request, res: Response) {
    try {
        const policies = await RoleAccessPolicyDAO.getAll();

        res.sendSuccess(policies);
    } catch (error: any) {
        AppLogger.error(`Get policies error: ${error.message}`);
        res.sendError(error.message || "Error retrieving role access policies", error.status || 500);
    }
}

/**
 * Get role access policy by role
 * @route GET /api/admin/role-policies/:role
 */
export async function getPolicyByRole(req: Request, res: Response) {
    try {
        const role = req.params.role as Role;

        // Validate role
        if (!Object.values(Role).includes(role)) {
            throw createHttpError(400, `Invalid role: ${role}`);
        }

        const policy = await RoleAccessPolicyDAO.getByRole(role);

        if (!policy) {
            throw createHttpError(404, `Policy for role '${role}' not found`);
        }

        res.sendSuccess(policy);
    } catch (error: any) {
        AppLogger.error(`Get policy error: ${error.message}`);
        res.sendError(error.message || "Error retrieving role access policies", error.status || 500);
    }
}

/**
 * Update role access policy
 * @route PUT /api/admin/role-policies/:role
 */
export async function updatePolicy(req: Request, res: Response) {
    try {
        const role = req.params.role as Role;
        const policyData = req.body;

        // Validate role
        if (!Object.values(Role).includes(role)) {
            throw createHttpError(400, `Invalid role: ${role}`);
        }

        // Ensure at least one of the policy fields is provided
        if (policyData.hasUnlimitedAccess === undefined &&
            policyData.requiresPackage === undefined &&
            !policyData.description) {
            throw createHttpError(400, "At least one policy field must be provided");
        }

        const updatedPolicy = await RoleAccessPolicyDAO.update(role, policyData);

        if (!updatedPolicy) {
            throw createHttpError(404, `Policy for role '${role}' not found`);
        }

        AppLogger.info(`Role access policy updated for role: ${role}`);
        res.sendSuccess(updatedPolicy);
    } catch (error: any) {
        AppLogger.error(`Update policy error: ${error.message}`);
        res.sendError(error.message || "Error updating role access policies", error.status || 500);
    }
}

/**
 * Reset all policies to default values
 * @route POST /api/admin/role-policies/reset
 */
export async function resetPolicies(req: Request, res: Response) {
    try {
        const count = await RoleAccessPolicyDAO.resetToDefaults();

        AppLogger.info(`Reset ${count} role access policies to defaults`);
        res.sendSuccess(null, `Reset ${count} role access policies to defaults`);
    } catch (error: any) {
        AppLogger.error(`Reset policies error: ${error.message}`);
        res.sendError(error.message || "Error resetting role access policies", error.status || 500);
    }
}

/**
 * Check if a role has unlimited access
 * @route GET /api/admin/role-policies/:role/has-unlimited-access
 */
export async function hasUnlimitedAccess(req: Request, res: Response) {
    try {
        const role = req.params.role as Role;

        // Validate role
        if (!Object.values(Role).includes(role)) {
            throw createHttpError(400, `Invalid role: ${role}`);
        }

        const hasUnlimitedAccess = await RoleAccessPolicyDAO.hasUnlimitedAccess(role);

        res.sendSuccess({role, hasUnlimitedAccess});
    } catch (error: any) {
        AppLogger.error(`Check unlimited access error: ${error.message}`);

        res.sendError(error.message || "Error checking if role has unlimited access", error.status || 500);
    }
}

/**
 * Check if a role requires a package
 * @route GET /api/admin/role-policies/:role/requires-package
 */
export async function requiresPackage(req: Request, res: Response) {
    try {
        const role = req.params.role as Role;

        // Validate role
        if (!Object.values(Role).includes(role)) {
            throw createHttpError(400, `Invalid role: ${role}`);
        }

        const requiresPackage = await RoleAccessPolicyDAO.requiresPackage(role);

        res.sendSuccess({role, requiresPackage});
    } catch (error: any) {
        AppLogger.error(`Check requires package error: ${error.message}`);

        res.sendError(error.message || "Error checking if role requires a package", error.status || 500);
    }
}
