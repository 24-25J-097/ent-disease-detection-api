import {Request, Response} from "express";
import {PackageDAO} from "../dao/Package.dao";
import {AppLogger} from "../utils/logging";
import createHttpError from "http-errors";
import {ApplicationError} from "../utils/application-error";

/**
 * Create a new package
 * @route POST /api/admin/packages
 */
export async function createPackage(req: Request, res: Response) {
    try {
        const packageData = req.body;

        // Validate required fields
        if (!packageData.name || !packageData.dailyRequestLimit || !packageData.durationInDays || packageData.price === undefined) {
            throw new ApplicationError("Missing required fields", 422);
        }

        const newPackage = await PackageDAO.create(packageData);

        AppLogger.info(`Package created: ${newPackage.name}`);
        res.sendSuccess(newPackage, undefined, 201);
    } catch (error: any) {
        AppLogger.error(`Create package error: ${error.message}`);
        if (error.status === 409) {
            res.sendError(error.message, 409)
        } else {
            res.sendError(error.message || "Error creating package", error.status || 500);
        }
    }
}

/**
 * Get all packages
 * @route GET /api/admin/packages
 * @route GET /api/packages (public route for available packages)
 */
export async function getAllPackages(req: Request, res: Response) {
    try {
        // For public routes, only show active packages
        const isPublicRoute = !req.originalUrl.includes('/admin/');
        const packages = await PackageDAO.getAll(isPublicRoute);

        res.sendSuccess(packages);
    } catch (error: any) {
        AppLogger.error(`Get packages error: ${error.message}`);
        res.sendError(error.message || "Error creating package", error.status || 500);

    }
}

/**
 * Get package by ID
 * @route GET /api/admin/packages/:id
 */
export async function getPackageById(req: Request, res: Response) {
    try {
        const packageId = req.params.id;
        const packageData = await PackageDAO.getById(packageId);

        if (!packageData) {
            throw createHttpError(404, "Package not found");
        }
        res.sendSuccess(packageData);
    } catch (error: any) {
        AppLogger.error(`Get package error: ${error.message}`);
        res.sendError(error.message || "Error retrieving package", error.status || 500);
    }
}

/**
 * Update package
 * @route PUT /api/admin/packages/:id
 */
export async function updatePackage(req: Request, res: Response) {
    try {
        const packageId = req.params.id;
        const packageData = req.body;

        const updatedPackage = await PackageDAO.update(packageId, packageData);

        if (!updatedPackage) {
            throw createHttpError(404, "Package not found");
        }

        AppLogger.info(`Package updated: ${updatedPackage.name}`);
        res.status(200).json({
            success: true,
            data: updatedPackage
        });
    } catch (error: any) {
        AppLogger.error(`Update package error: ${error.message}`);
        if (error.status === 409) {
            res.sendError(error.message || "Error retrieving package", 409);
        } else {
            res.sendError(error.message || "Error updating package", error.status || 500);
        }
    }
}

/**
 * Delete package
 * @route DELETE /api/admin/packages/:id
 */
export async function deletePackage(req: Request, res: Response) {
    try {
        const packageId = req.params.id;
        const deletedPackage = await PackageDAO.delete(packageId);

        if (!deletedPackage) {
            throw createHttpError(404, "Package not found");
        }

        AppLogger.info(`Package deleted: ${deletedPackage.name}`);
        res.sendSuccess(deletedPackage);
    } catch (error: any) {
        AppLogger.error(`Delete package error: ${error.message}`);
        res.sendError(error.message || "Error deleting package", error.status || 500);
    }
}

/**
 * Activate or deactivate package
 * @route PATCH /api/admin/packages/:id/status
 */
export async function setPackageStatus(req: Request, res: Response) {
    try {
        const packageId = req.params.id;
        const {isActive} = req.body;

        if (isActive === undefined) {
            throw createHttpError(400, "isActive field is required");
        }

        const updatedPackage = await PackageDAO.setActive(packageId, isActive);

        if (!updatedPackage) {
            throw createHttpError(404, "Package not found");
        }

        const status = isActive ? "activated" : "deactivated";
        AppLogger.info(`Package ${status}: ${updatedPackage.name}`);

        res.sendSuccess(updatedPackage);
    } catch (error: any) {
        AppLogger.error(`Set package status error: ${error.message}`);
        res.sendError(error.message || "Error updating package", error.status || 500);
    }
}
