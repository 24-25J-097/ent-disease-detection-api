import * as mongoose from "mongoose";
import {StringOrObjectId} from "../types/util-types";
import {RoleAccessPolicy} from "../schemas/RoleAccessPolicy.schema";
import {Role} from "../enums/auth";

export interface DRoleAccessPolicy {
    _id?: StringOrObjectId;
    role: Role;
    hasUnlimitedAccess: boolean;
    requiresPackage: boolean;
    description?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IRoleAccessPolicy extends mongoose.Document, DRoleAccessPolicy {
    readonly _id: mongoose.Types.ObjectId;
}

/**
 * Get access policy for a specific role
 * @param role Role to get policy for
 * @returns Promise with the role access policy or null if not found
 */
export async function getRoleAccessPolicy(role: Role): Promise<IRoleAccessPolicy | null> {
    return RoleAccessPolicy.findOne({role});
}

/**
 * Initialize default role access policies if they don't exist
 */
export async function initializeDefaultPolicies(): Promise<void> {
    const roles = [Role.ADMIN, Role.DOCTOR, Role.RADIOLOGIST, Role.STUDENT, Role.PATIENT];

    for (const role of roles) {
        const exists = await RoleAccessPolicy.exists({role});

        if (!exists) {
            // Default policies
            const defaultPolicy: DRoleAccessPolicy = {
                role,
                hasUnlimitedAccess: role === Role.ADMIN, // Admin has unlimited access by default
                requiresPackage: role === Role.STUDENT, // Only students require packages by default
                description: `Default access policy for ${role} role`
            };

            await RoleAccessPolicy.create(defaultPolicy);

            console.log('Role access policies initialized');
        }
    }
}