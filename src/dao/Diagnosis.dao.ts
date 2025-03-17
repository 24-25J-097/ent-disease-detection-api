import {AppLogger} from "../utils/logging";
import Upload from "../schemas/Upload.schema";
import Cholesteatoma from "../schemas/Cholesteatoma.schema";
import {DCholesteatoma, ICholesteatoma} from "../models/Cholesteatoma.model";
import {ApplicationError} from "../utils/application-error";
import {DUpload} from "../models/Upload.model";
import {IUser} from "../models/User.model";
import User from "../schemas/User.schema";
import {Role} from "../enums/auth";

export async function createCholesteatomaDiagnosis(data: Partial<DCholesteatoma>, endoscopyImageFile: Express.Multer.File): Promise<ICholesteatoma> {
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

        const cholesteatomaData: DCholesteatoma = {
            diagnosticianId: data.diagnosticianId,
            patientId: data.patientId ?? "defaultId",
            additionalInformation: data.additionalInformation,
            endoscopyImage: savedFile._id,
        };
        const iDiagnosis = new Cholesteatoma(cholesteatomaData);
        const savedDiagnosis = await iDiagnosis.save();
        AppLogger.info(`Create Cholesteatoma Diagnosis (ID: ${savedDiagnosis._id}) by (ID: ${data.diagnosticianId})`);
        return savedDiagnosis;

    } catch (error: unknown) {
        if (error instanceof Error) {
            AppLogger.error(`Creating cholesteatoma: ${error.message}`);
            throw new ApplicationError(`Creating cholesteatoma: ${error.message}`);
        }
        throw error;
    }
}

export async function updateCholesteatomaDiagnosis(diagnosisId: string, data: Partial<DCholesteatoma>): Promise<ICholesteatoma> {
    const updatedDiagnosis = await Cholesteatoma.findByIdAndUpdate(diagnosisId, data, {new: true});
    if (updatedDiagnosis) {
        AppLogger.info(`Update diagnosis (ID: ${updatedDiagnosis._id}) by (ID: ${updatedDiagnosis.diagnosticianId})`);
        return updatedDiagnosis;
    } else {
        AppLogger.error(`Cholesteatoma (ID: ${diagnosisId}): Not Found`);
        throw new ApplicationError(`Update cholesteatoma: Cholesteatoma not found for ID: ${diagnosisId}!`, 404);
    }
}

export async function getCholesteatomaReports(ownUser: IUser) {
    const cholesteatomaData = await Cholesteatoma.find();

    if (!cholesteatomaData || cholesteatomaData.length === 0) {
        AppLogger.error("Cholesteatoma Data: Not Found");
        throw new ApplicationError("Get cholesteatoma: Cholesteatoma data not found!", 404);
    }

    const diagnosisStatus = [
        {
            name: "Diagnosed",
            value: cholesteatomaData.filter(c => c.status === "diagnosed").length
        },
        {
            name: "Failed",
            value: cholesteatomaData.filter(c => c.status === "failed").length
        },
        {
            name: "Pending",
            value: cholesteatomaData.filter(c => c.status === "pending").length
        }
    ];

    const cholesteatomaStages = [
        {
            stage: "Stage 1",
            count: cholesteatomaData.filter(c => (
                c.diagnosisResult?.stage?.includes("Stage 1")
            )).length
        },
        {
            stage: "Stage 2",
            count: cholesteatomaData.filter(c => (
                c.diagnosisResult?.stage?.includes("Stage 2")
            )).length
        },
        {
            stage: "Stage 3",
            count: cholesteatomaData.filter(c => (
                c.diagnosisResult?.stage?.includes("Stage 3")
            )).length
        }
    ];

    const confidenceScores = [
        {
            scoreRange: "0-10%",
            count: cholesteatomaData.filter(c => (
                c.diagnosisResult?.confidenceScore &&
                (c.diagnosisResult.confidenceScore * 100) <= 10
            )).length
        },
        {
            scoreRange: "11-20%",
            count: cholesteatomaData.filter(c => (
                c.diagnosisResult?.confidenceScore &&
                (c.diagnosisResult.confidenceScore * 100) > 10 &&
                (c.diagnosisResult.confidenceScore * 100) <= 20
            )).length
        },
        {
            scoreRange: "21-30%",
            count: cholesteatomaData.filter(c => (
                c.diagnosisResult?.confidenceScore &&
                (c.diagnosisResult.confidenceScore * 100) > 20 &&
                (c.diagnosisResult.confidenceScore * 100) <= 30
            )).length
        },
        {
            scoreRange: "31-40%",
            count: cholesteatomaData.filter(c => (
                c.diagnosisResult?.confidenceScore &&
                (c.diagnosisResult.confidenceScore * 100) > 30 &&
                (c.diagnosisResult.confidenceScore * 100) <= 40
            )).length
        },
        {
            scoreRange: "41-50%",
            count: cholesteatomaData.filter(c => (
                c.diagnosisResult?.confidenceScore &&
                (c.diagnosisResult.confidenceScore * 100) > 40 &&
                (c.diagnosisResult.confidenceScore * 100) <= 50
            )).length
        },
        {
            scoreRange: "51-60%",
            count: cholesteatomaData.filter(c => (
                c.diagnosisResult?.confidenceScore &&
                (c.diagnosisResult.confidenceScore * 100) > 50 &&
                (c.diagnosisResult.confidenceScore * 100) <= 60
            )).length
        },
        {
            scoreRange: "61-70%",
            count: cholesteatomaData.filter(c => (
                c.diagnosisResult?.confidenceScore &&
                (c.diagnosisResult.confidenceScore * 100) > 60 &&
                (c.diagnosisResult.confidenceScore * 100) <= 70
            )).length
        },
        {
            scoreRange: "71-80%",
            count: cholesteatomaData.filter(c => (
                c.diagnosisResult?.confidenceScore &&
                (c.diagnosisResult.confidenceScore * 100) > 70 &&
                (c.diagnosisResult.confidenceScore * 100) <= 80
            )).length
        },
        {
            scoreRange: "81-90%",
            count: cholesteatomaData.filter(c => (
                c.diagnosisResult?.confidenceScore &&
                (c.diagnosisResult.confidenceScore * 100) > 80 &&
                (c.diagnosisResult.confidenceScore * 100) <= 90
            )).length
        },
        {
            scoreRange: "91-100%",
            count: cholesteatomaData.filter(c => (
                c.diagnosisResult?.confidenceScore &&
                (c.diagnosisResult.confidenceScore * 100) > 90 &&
                (c.diagnosisResult.confidenceScore * 100) <= 100
            )).length
        }
    ];

    const cholesteatomaVsHealthy = [
        {
            name: "Cholesteatoma",
            value: cholesteatomaData.filter(c => (
                c.diagnosisResult?.isCholesteatoma
            )).length
        },
        {
            name: "Healthy",
            value: cholesteatomaData.filter(c => (
                c.diagnosisResult?.isCholesteatoma === false
            )).length
        }
    ];

    AppLogger.info(`Get cholesteatoma reports data (count: ${cholesteatomaData.length}) by (ID: ${ownUser._id})`);

    return {
        diagnosisStatus,
        cholesteatomaStages,
        confidenceScores,
        cholesteatomaVsHealthy
    };
}

export async function getCholesteatomaData(ownUser: IUser) {
    const cholesteatomaData = await Cholesteatoma.find();
    if (cholesteatomaData) {
        AppLogger.info(`Got cholesteatoma list - Count: ${cholesteatomaData.length} by ${Role.getTitle(ownUser.role)} (ID: ${ownUser._id})`);
        return cholesteatomaData;
    } else {
        AppLogger.error(`Get a cholesteatoma list: Not Found`);
        throw new ApplicationError(`Get a cholesteatoma list: Cholesteatoma not found!`, 404);
    }
}
