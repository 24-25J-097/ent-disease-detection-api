import {AppLogger} from "../utils/logging";
import Upload from "../schemas/Upload.schema";
import Cholesteatoma from "../schemas/Cholesteatoma.schema";
import {DCholesteatoma, ICholesteatoma} from "../models/Cholesteatoma.model";
import {ApplicationError} from "../utils/application-error";
import {DUpload} from "../models/Upload.model";

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
