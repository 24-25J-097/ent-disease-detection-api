import {AppLogger} from "../utils/logging";
import Upload from "../schemas/Upload.schema";
import Pharyngitis from "../schemas/Pharyngitis.schema";
import {DPharyngitis, IPharyngitis} from "../models/Pharyngitis.model";
import {ApplicationError} from "../utils/application-error";
import {DUpload} from "../models/Upload.model";
import {IUser} from "../global";
import {Role} from "../enums/auth";

export async function createPharyngitisDiagnosis(data: Partial<DPharyngitis>, endoscopyImageFile: Express.Multer.File): Promise<IPharyngitis> {
    try {
        const uploadData: DUpload = {
            ownerId: data.patientId,
            type: endoscopyImageFile.mimetype,
            path: endoscopyImageFile.path,
            originalName: endoscopyImageFile.originalname,
            name: endoscopyImageFile.filename,
            extension: endoscopyImageFile.mimetype.split("/")[1],
            isUrl: false,
            fileSize: endoscopyImageFile.size,
        };
        const iUpload = new Upload(uploadData);
        const savedFile = await iUpload.save();
        AppLogger.info(`Save file in uploads (ID: ${savedFile._id}) by (ID: ${data.diagnosticianId})`);

        const pharyngitisData: DPharyngitis = {
            diagnosticianId: data.diagnosticianId,
            patientId: data.patientId ?? "defaultId",
            additionalInformation: data.additionalInformation,
            isLearningPurpose: data.isLearningPurpose ?? false,
            throatImage: savedFile._id,
        };
        const iDiagnosis = new Pharyngitis(pharyngitisData);
        const savedDiagnosis = await iDiagnosis.save();
        AppLogger.info(`Create Pharyngitis Diagnosis (ID: ${savedDiagnosis._id}) by (ID: ${data.diagnosticianId})`);
        return savedDiagnosis;

    } catch (error: unknown) {
        if (error instanceof Error) {
            AppLogger.error(`Creating pharyngitis: ${error.message}`);
            throw new ApplicationError(`Creating pharyngitis: ${error.message}`);
        }
        throw error;
    }
}

export async function updatePharyngitisDiagnosis(diagnosisId: string, data: Partial<DPharyngitis>): Promise<IPharyngitis> {
    const updatedDiagnosis = await Pharyngitis.findByIdAndUpdate(diagnosisId, data, {new: true});
    if (updatedDiagnosis) {
        AppLogger.info(`Update diagnosis (ID: ${updatedDiagnosis._id}) by (ID: ${updatedDiagnosis.diagnosticianId})`);
        return updatedDiagnosis;
    } else {
        AppLogger.error(`Pharyngitis (ID: ${diagnosisId}): Not Found`);
        throw new ApplicationError(`Update pharyngitis: Pharyngitis not found for ID: ${diagnosisId}!`, 404);
    }
}


export async function getPharyngitisReports(ownUser: IUser) {
    const pharyngitisData = await Pharyngitis.find();

    if (!pharyngitisData || pharyngitisData.length === 0) {
        AppLogger.error("Pharyngitis Data: Not Found");
        throw new ApplicationError("Get pharyngitis: Pharyngitis data not found!", 404);
    }

    const diagnosisStatus = [
        {
            name: "Diagnosed",
            value: pharyngitisData.filter(c => c.status === "diagnosed").length
        },
        {
            name: "Failed",
            value: pharyngitisData.filter(c => c.status === "failed").length
        },
        {
            name: "Pending",
            value: pharyngitisData.filter(c => c.status === "pending").length
        }
    ];

    const pharyngitisStage = [
        {
            stage: "Normal",
            count: pharyngitisData.filter(c => (
                c.diagnosisResult?.stage?.includes("Healthy")
            )).length
        },
        {
            stage: "Moderate",
            count: pharyngitisData.filter(c => (
                c.diagnosisResult?.stage?.includes("Moderate")
            )).length
        },
        {
            stage: "Tonsillitis",
            count: pharyngitisData.filter(c => (
                c.diagnosisResult?.stage?.includes("Tonsillitis")
            )).length
        }
    ];

    const confidenceScores = [
        {
            scoreRange: "0-10%",
            count: pharyngitisData.filter(c => (
                c.diagnosisResult?.confidenceScore &&
                (c.diagnosisResult.confidenceScore * 100) <= 10
            )).length
        },
        {
            scoreRange: "11-20%",
            count: pharyngitisData.filter(c => (
                c.diagnosisResult?.confidenceScore &&
                (c.diagnosisResult.confidenceScore * 100) > 10 &&
                (c.diagnosisResult.confidenceScore * 100) <= 20
            )).length
        },
        {
            scoreRange: "21-30%",
            count: pharyngitisData.filter(c => (
                c.diagnosisResult?.confidenceScore &&
                (c.diagnosisResult.confidenceScore * 100) > 20 &&
                (c.diagnosisResult.confidenceScore * 100) <= 30
            )).length
        },
        {
            scoreRange: "31-40%",
            count: pharyngitisData.filter(c => (
                c.diagnosisResult?.confidenceScore &&
                (c.diagnosisResult.confidenceScore * 100) > 30 &&
                (c.diagnosisResult.confidenceScore * 100) <= 40
            )).length
        },
        {
            scoreRange: "41-50%",
            count: pharyngitisData.filter(c => (
                c.diagnosisResult?.confidenceScore &&
                (c.diagnosisResult.confidenceScore * 100) > 40 &&
                (c.diagnosisResult.confidenceScore * 100) <= 50
            )).length
        },
        {
            scoreRange: "51-60%",
            count: pharyngitisData.filter(c => (
                c.diagnosisResult?.confidenceScore &&
                (c.diagnosisResult.confidenceScore * 100) > 50 &&
                (c.diagnosisResult.confidenceScore * 100) <= 60
            )).length
        },
        {
            scoreRange: "61-70%",
            count: pharyngitisData.filter(c => (
                c.diagnosisResult?.confidenceScore &&
                (c.diagnosisResult.confidenceScore * 100) > 60 &&
                (c.diagnosisResult.confidenceScore * 100) <= 70
            )).length
        },
        {
            scoreRange: "71-80%",
            count: pharyngitisData.filter(c => (
                c.diagnosisResult?.confidenceScore &&
                (c.diagnosisResult.confidenceScore * 100) > 70 &&
                (c.diagnosisResult.confidenceScore * 100) <= 80
            )).length
        },
        {
            scoreRange: "81-90%",
            count: pharyngitisData.filter(c => (
                c.diagnosisResult?.confidenceScore &&
                (c.diagnosisResult.confidenceScore * 100) > 80 &&
                (c.diagnosisResult.confidenceScore * 100) <= 90
            )).length
        },
        {
            scoreRange: "91-100%",
            count: pharyngitisData.filter(c => (
                c.diagnosisResult?.confidenceScore &&
                (c.diagnosisResult.confidenceScore * 100) > 90 &&
                (c.diagnosisResult.confidenceScore * 100) <= 100
            )).length
        }
    ];

    const pharyngitisVsHealthy = [
        {
            name: "Pharyngitis",
            value: pharyngitisData.filter(c => (
                c.diagnosisResult?.isPharyngitis
            )).length
        },
        {
            name: "Healthy",
            value: pharyngitisData.filter(c => (
                c.diagnosisResult?.isPharyngitis === false
            )).length
        }
    ];

    AppLogger.info(`Get pharyngitis reports data (count: ${pharyngitisData.length}) by (ID: ${ownUser._id})`);

    return {
        diagnosisStatus,
        pharyngitisStage,
        confidenceScores,
        pharyngitisVsHealthy
    };
}


export async function getPharyngitisData(ownUser: IUser) {
    const pharyngitis = await Pharyngitis.find();
    if (pharyngitis) {
        AppLogger.info(`Got pharyngitis list - Count: ${pharyngitis.length} by ${Role.getTitle(ownUser.role)} (ID: ${ownUser._id})`);
        return pharyngitis;
    } else {
        AppLogger.error(`Get a pharyngitis list: Not Found`);
        throw new ApplicationError(`Get a pharyngitis list: Pharyngitis not found!`, 404);
    }
}


export async function getPharyngitisImage(ownUser: IUser | null, uploadId: string) {
    const image = await Upload.findOne({_id: uploadId});
    if (image) {
        AppLogger.info(`Got pharyngitis image ${ownUser && `by ${Role.getTitle(ownUser.role)} (ID: ${ownUser._id})`}`);
        return image.path;
    } else {
        AppLogger.error(`Get a pharyngitis list: Not Found`);
        throw new ApplicationError("Pharyngitis image not found", 404);
    }
}
