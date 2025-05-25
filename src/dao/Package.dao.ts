import {DPackage, IPackage} from "../models/Package.model";
import {StringOrObjectId} from "../types/util-types";
import createHttpError from "http-errors";
import {Package} from "../schemas/Package.schema";
import {AppLogger} from "../utils/logging";
import {ApplicationError} from "../utils/application-error";

export class PackageDAO {
    /**
     * Create a new package
     * @param packageData Package data to create
     * @returns Promise with the created package
     */
    static async create(packageData: DPackage): Promise<IPackage> {
        try {
            // Check if package with same name already exists
            const existingPackage = await Package.findOne({name: packageData.name});
            if (existingPackage) {
                throw new ApplicationError(`Package with name '${packageData.name}' already exists`, 409);
            }

            const newPackage = new Package(packageData);
            return await newPackage.save();
        } catch (error) {
            if (error instanceof Error) {
                AppLogger.error(`Creating Package: ${error.message}`);
                throw new ApplicationError(`Creating Package: ${error.message}`);
            }
            throw error;
        }
    }

    /**
     * Get all packages
     * @param activeOnly If true, only return active packages
     * @returns Promise with array of packages
     */
    static async getAll(activeOnly = false): Promise<IPackage[]> {
        try {
            const query = activeOnly ? {isActive: true} : {};
            return await Package.find(query).sort({price: 1});
        } catch (error) {
            if (error instanceof Error) {
                AppLogger.error(`Get Packages: ${error.message}`);
                throw new ApplicationError(`Get Packages: ${error.message}`);
            }
            throw error;
        }
    }

    /**
     * Get package by ID
     * @param id Package ID
     * @returns Promise with the package or null if not found
     */
    static async getById(id: StringOrObjectId): Promise<IPackage | null> {
        try {
            return await Package.findById(id);
        } catch (error) {
            if (error instanceof Error) {
                AppLogger.error(`Get Package: ${error.message}`);
                throw new ApplicationError(`Get Package: ${error.message}`);
            }
            throw error;
        }
    }

    /**
     * Update package
     * @param id Package ID
     * @param packageData Updated package data
     * @returns Promise with the updated package
     */
    static async update(id: StringOrObjectId, packageData: Partial<DPackage>): Promise<IPackage | null> {
        try {
            // Check if updating name and if it already exists
            if (packageData.name) {
                const existingPackage = await Package.findOne({
                    name: packageData.name,
                    _id: {$ne: id}
                });

                if (existingPackage) {
                    throw createHttpError(409, `Package with name '${packageData.name}' already exists`);
                }
            }

            return await Package.findByIdAndUpdate(
                id,
                {...packageData, updatedAt: new Date()},
                {new: true, runValidators: true}
            );
        } catch (error) {
            if (error instanceof Error) {
                AppLogger.error(`Update Packages: ${error.message}`);
                throw new ApplicationError(`Update Packages: ${error.message}`);
            }
            throw error;
        }
    }

    /**
     * Delete package
     * @param id Package ID
     * @returns Promise with the deleted package
     */
    static async delete(id: StringOrObjectId): Promise<IPackage | null> {
        try {
            return await Package.findByIdAndDelete(id);
        } catch (error) {
            if (error instanceof Error) {
                AppLogger.error(`Delete Packages: ${error.message}`);
                throw new ApplicationError(`Delete Packages: ${error.message}`);
            }
            throw error;
        }
    }

    /**
     * Activate or deactivate package
     * @param id Package ID
     * @param isActive Whether to activate or deactivate
     * @returns Promise with the updated package
     */
    static async setActive(id: StringOrObjectId, isActive: boolean): Promise<IPackage | null> {
        try {
            return await Package.findByIdAndUpdate(
                id,
                {isActive, updatedAt: new Date()},
                {new: true}
            );
        } catch (error) {
            if (error instanceof Error) {
                AppLogger.error(`Update Packages: ${error.message}`);
                throw new ApplicationError(`Update Packages: ${error.message}`);
            }
            throw error;
        }
    }
}