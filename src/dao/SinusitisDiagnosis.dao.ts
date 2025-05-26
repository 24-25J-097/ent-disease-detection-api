import {AppLogger} from "../utils/logging";
import Upload from "../schemas/Upload.schema";
import Sinusitis from "../schemas/Sinusitis.schema";
import {DSinusitis, ISinusitis} from "../models/Sinusitis.model";
import {ApplicationError} from "../utils/application-error";
import {DUpload} from "../models/Upload.model";
import {IUser} from "../global";
import {Role} from "../enums/auth";
import mongoose from "mongoose";
import {IPatient} from "../models/Patient.model";

export async function createSinusitisDiagnosis(data: Partial<DSinusitis>, watersViewXrayImageFile: Express.Multer.File): Promise<ISinusitis> {
    try {
        const uploadData: DUpload = {
            ownerId: data.patientId,
            type: watersViewXrayImageFile.mimetype,
            path: watersViewXrayImageFile.path,
            originalName: watersViewXrayImageFile.originalname,
            name: watersViewXrayImageFile.filename,
            extension: watersViewXrayImageFile.mimetype.split("/")[1],
            isUrl: false,
            fileSize: watersViewXrayImageFile.size,
        };
        const iUpload = new Upload(uploadData);
        const savedFile = await iUpload.save();
        AppLogger.info(`Save file in uploads (ID: ${savedFile._id}) by (ID: ${data.diagnosticianId})`);

        // Convert patientId to ObjectId if it's a valid MongoDB ObjectId
        let patientObjectId;
        if (data.patientId && mongoose.Types.ObjectId.isValid(data.patientId)) {
            patientObjectId = new mongoose.Types.ObjectId(data.patientId);
        } else {
            AppLogger.warn(`Invalid MongoDB ObjectId for patientId: ${data.patientId}. Using default.`);
            patientObjectId = new mongoose.Types.ObjectId("000000000000000000000000"); // Default ObjectId
        }

        const sinusitisData: DSinusitis = {
            diagnosticianId: data.diagnosticianId,
            patientId: patientObjectId,
            additionalInformation: data.additionalInformation,
            watersViewXrayImage: savedFile._id,
        };
        const iDiagnosis = new Sinusitis(sinusitisData);
        const savedDiagnosis = await iDiagnosis.save();
        AppLogger.info(`Create Sinusitis Diagnosis (ID: ${savedDiagnosis._id}) by (ID: ${data.diagnosticianId})`);
        return savedDiagnosis;

    } catch (error: unknown) {
        if (error instanceof Error) {
            AppLogger.error(`Creating sinusitis: ${error.message}`);
            throw new ApplicationError(`Creating sinusitis: ${error.message}`);
        }
        throw error;
    }
}

export async function updateSinusitisDiagnosis(diagnosisId: string, data: Partial<DSinusitis>): Promise<ISinusitis> {
    const updatedDiagnosis = await Sinusitis.findByIdAndUpdate(diagnosisId, data, {new: true});
    if (updatedDiagnosis) {
        AppLogger.info(`Update diagnosis (ID: ${updatedDiagnosis._id}) by (ID: ${updatedDiagnosis.diagnosticianId})`);
        return updatedDiagnosis;
    } else {
        AppLogger.error(`Sinusitis (ID: ${diagnosisId}): Not Found`);
        throw new ApplicationError(`Update sinusitis: Sinusitis not found for ID: ${diagnosisId}!`, 404);
    }
}

export async function getSinusitisReports(ownUser: IUser) {
    const sinusitisData = await Sinusitis.find();

    if (!sinusitisData || sinusitisData.length === 0) {
        AppLogger.error("Sinusitis Data: Not Found");
        throw new ApplicationError("Get sinusitis: Sinusitis data not found!", 404);
    }

    const diagnosisStatus = [
        {
            name: "Diagnosed",
            value: sinusitisData.filter(c => c.status === "diagnosed").length
        },
        {
            name: "Failed",
            value: sinusitisData.filter(c => c.status === "failed").length
        },
        {
            name: "Pending",
            value: sinusitisData.filter(c => c.status === "pending").length
        }
    ];

    const sinusitisSeverity = [
        {
            severity: "Healthy/Mild",
            count: sinusitisData.filter(c => (
                c.diagnosisResult?.severity?.includes("Mild")
            )).length
        },
        {
            severity: "Moderate",
            count: sinusitisData.filter(c => (
                c.diagnosisResult?.severity?.includes("Moderate")
            )).length
        },
        {
            severity: "Severe",
            count: sinusitisData.filter(c => (
                c.diagnosisResult?.severity?.includes("Severe")
            )).length
        }
    ];

    const confidenceScores = [
        {
            scoreRange: "0-10%",
            count: sinusitisData.filter(c => (
                c.diagnosisResult?.confidenceScore &&
                (c.diagnosisResult.confidenceScore * 100) <= 10
            )).length
        },
        {
            scoreRange: "11-20%",
            count: sinusitisData.filter(c => (
                c.diagnosisResult?.confidenceScore &&
                (c.diagnosisResult.confidenceScore * 100) > 10 &&
                (c.diagnosisResult.confidenceScore * 100) <= 20
            )).length
        },
        {
            scoreRange: "21-30%",
            count: sinusitisData.filter(c => (
                c.diagnosisResult?.confidenceScore &&
                (c.diagnosisResult.confidenceScore * 100) > 20 &&
                (c.diagnosisResult.confidenceScore * 100) <= 30
            )).length
        },
        {
            scoreRange: "31-40%",
            count: sinusitisData.filter(c => (
                c.diagnosisResult?.confidenceScore &&
                (c.diagnosisResult.confidenceScore * 100) > 30 &&
                (c.diagnosisResult.confidenceScore * 100) <= 40
            )).length
        },
        {
            scoreRange: "41-50%",
            count: sinusitisData.filter(c => (
                c.diagnosisResult?.confidenceScore &&
                (c.diagnosisResult.confidenceScore * 100) > 40 &&
                (c.diagnosisResult.confidenceScore * 100) <= 50
            )).length
        },
        {
            scoreRange: "51-60%",
            count: sinusitisData.filter(c => (
                c.diagnosisResult?.confidenceScore &&
                (c.diagnosisResult.confidenceScore * 100) > 50 &&
                (c.diagnosisResult.confidenceScore * 100) <= 60
            )).length
        },
        {
            scoreRange: "61-70%",
            count: sinusitisData.filter(c => (
                c.diagnosisResult?.confidenceScore &&
                (c.diagnosisResult.confidenceScore * 100) > 60 &&
                (c.diagnosisResult.confidenceScore * 100) <= 70
            )).length
        },
        {
            scoreRange: "71-80%",
            count: sinusitisData.filter(c => (
                c.diagnosisResult?.confidenceScore &&
                (c.diagnosisResult.confidenceScore * 100) > 70 &&
                (c.diagnosisResult.confidenceScore * 100) <= 80
            )).length
        },
        {
            scoreRange: "81-90%",
            count: sinusitisData.filter(c => (
                c.diagnosisResult?.confidenceScore &&
                (c.diagnosisResult.confidenceScore * 100) > 80 &&
                (c.diagnosisResult.confidenceScore * 100) <= 90
            )).length
        },
        {
            scoreRange: "91-100%",
            count: sinusitisData.filter(c => (
                c.diagnosisResult?.confidenceScore &&
                (c.diagnosisResult.confidenceScore * 100) > 90 &&
                (c.diagnosisResult.confidenceScore * 100) <= 100
            )).length
        }
    ];

    const sinusitisVsHealthy = [
        {
            name: "Sinusitis",
            value: sinusitisData.filter(c => (
                c.diagnosisResult?.isSinusitis
            )).length
        },
        {
            name: "Healthy",
            value: sinusitisData.filter(c => (
                c.diagnosisResult?.isSinusitis === false
            )).length
        }
    ];

    const monthlySeverityTrends: { month: string; mild: number; moderate: number; severe: number }[] = [];

    // Group data by month and severity
    for (let month = 0; month < 12; month++) {
        const monthData = sinusitisData.filter((c) => {
            const recordMonth = new Date(c.createdAt!).getMonth();
            return recordMonth === month;
        });

        monthlySeverityTrends.push({
            month: new Date(2024, month, 1).toLocaleString("default", {month: "short"}),
            mild: monthData.filter(c => c.diagnosisResult?.severity?.includes("Mild")).length,
            moderate: monthData.filter(c => c.diagnosisResult?.severity?.includes("Moderate")).length,
            severe: monthData.filter(c => c.diagnosisResult?.severity?.includes("Severe")).length,
        });
    }

    AppLogger.info(`Get sinusitis reports data (count: ${sinusitisData.length}) by (ID: ${ownUser._id})`);

    return {
        diagnosisStatus,
        sinusitisSeverity,
        confidenceScores,
        sinusitisVsHealthy,
        monthlySeverityTrends
    };
}


export async function getSinusitisData(ownUser: IUser) {
    try {
        // Find all sinusitis records
        const sinusitis = await Sinusitis.find();

        if (!sinusitis || sinusitis.length === 0) {
            AppLogger.error(`Get a sinusitis list: Not Found`);
            throw new ApplicationError(`Get a sinusitis list: Sinusitis not found!`, 404);
        }

        // Populate patient data for valid MongoDB ObjectIds
        const populatedSinusitis = await Promise.all(
            sinusitis.map(async (record) => {
                try {
                    // Check if patientId is a valid MongoDB ObjectId
                    if (mongoose.Types.ObjectId.isValid(record.patientId)) {
                        // If valid, populate the patient data
                        // return await Sinusitis.findById(record._id).populate('patientId');
                        const patientPopulated = await Sinusitis.findById(record._id)
                            .populate('patientId')
                            .lean();

                        if (patientPopulated && patientPopulated.patientId) {
                            const patient = patientPopulated.patientId as unknown as IPatient;

                            // Add `patient` field for easier access
                            (patientPopulated as any).patient = patient;

                            // Replace `sinusitis.patientId` (_id) with patient's custom `patientId`
                            (patientPopulated as any).patientId = patient.patientId ?? record.patientId ?? patient._id;
                        }

                        return patientPopulated;


                    } else {
                        // If not valid, return the record as is
                        return record;
                    }
                } catch (error: any) {
                    // If there's an error populating, return the record as is
                    AppLogger.error(`Error populating patient data for record ${record._id}: ${error.message}`);
                    return record;
                }
            })
        );

        AppLogger.info(`Got sinusitis list - Count: ${sinusitis.length} by ${Role.getTitle(ownUser.role)} (ID: ${ownUser._id})`);
        return populatedSinusitis;
    } catch (error: any) {
        if (error instanceof ApplicationError) {
            throw error;
        }
        AppLogger.error(`Getting sinusitis data: ${error.message}`);
        throw new ApplicationError(`Getting sinusitis data: ${error.message}`);
    }
}


export async function getSinusitisImage(ownUser: IUser | null, uploadId: string) {
    const image = await Upload.findOne({_id: uploadId});
    if (image) {
        AppLogger.info(`Got sinusitis image ${ownUser && `by ${Role.getTitle(ownUser.role)} (ID: ${ownUser._id})`}`);
        return image.path;
    } else {
        AppLogger.error(`Get a sinusitis list: Not Found`);
        throw new ApplicationError("Sinusitis image not found", 404);
    }
}
