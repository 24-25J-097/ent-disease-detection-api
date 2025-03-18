import {AppLogger} from "../utils/logging";
import Upload from "../schemas/Upload.schema";
import Sinusitis from "../schemas/Sinusitis.schema";
import {DSinusitis, ISinusitis} from "../models/Sinusitis.model";
import {ApplicationError} from "../utils/application-error";
import {DUpload} from "../models/Upload.model";
import {IUser} from "../global";
import {Role} from "../enums/auth";

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

        const sinusitisData: DSinusitis = {
            diagnosticianId: data.diagnosticianId,
            patientId: data.patientId ?? "defaultId",
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

    AppLogger.info(`Get sinusitis reports data (count: ${sinusitisData.length}) by (ID: ${ownUser._id})`);

    return {
        diagnosisStatus,
        sinusitisSeverity,
        confidenceScores,
        sinusitisVsHealthy
    };
}


export async function getSinusitisData(ownUser: IUser) {
    const sinusitis = await Sinusitis.find();
    if (sinusitis) {
        AppLogger.info(`Got sinusitis list - Count: ${sinusitis.length} by ${Role.getTitle(ownUser.role)} (ID: ${ownUser._id})`);
        return sinusitis;
    } else {
        AppLogger.error(`Get a sinusitis list: Not Found`);
        throw new ApplicationError(`Get a sinusitis list: Sinusitis not found!`, 404);
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