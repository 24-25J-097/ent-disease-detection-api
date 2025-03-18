import {AppLogger} from "../utils/logging";
import Upload from "../schemas/Upload.schema";
import Sinusitis from "../schemas/Sinusitis.schema";
import {DSinusitis, ISinusitis} from "../models/Sinusitis.model";
import {ApplicationError} from "../utils/application-error";
import {DUpload} from "../models/Upload.model";

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
