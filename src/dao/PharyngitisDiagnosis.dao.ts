import {AppLogger} from "../utils/logging";
import Upload from "../schemas/Upload.schema";
import Pharyngitis from "../schemas/Pharyngitis.schema";
import {DPharyngitis, IPharyngitis} from "../models/Pharyngitis.model";
import {ApplicationError} from "../utils/application-error";
import {DUpload} from "../models/Upload.model";

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
