import {NextFunction, Request, Response} from "express";
import * as DiagnosisDao from "../dao/Diagnosis.dao";
import {DCholesteatoma} from "../models/Cholesteatoma.model";
import env from "../utils/validate-env";
import axios from 'axios';
import {AppLogger} from "../utils/logging";
import FormData from "form-data";

export async function cholesteatomaDiagnosis(req: Request, res: Response, next: NextFunction) {

    const {patientId, additionalInfo} = req.body;
    const endoscopyImageFile = req.file;

    if (!patientId || !endoscopyImageFile) {
        return res.status(400).send({
            message: "Patient ID and endoscopy image are required.",
        });
    }

    const data: Partial<DCholesteatoma> = {
        diagnosticianId: req.user?._id,
        patientId: patientId as string,
        additionalInformation: additionalInfo
    }

    try {
        const savedDiagnosis = await DiagnosisDao.createCholesteatomaDiagnosis(data, endoscopyImageFile);

        const updatedDiagnosis = await cholesteatomaIdentification(savedDiagnosis._id.toString(), endoscopyImageFile);

        res.sendSuccess(updatedDiagnosis, "Cholesteatoma diagnosis saved and updated with results!");
    } catch (error) {
        next(error);
    }

    // await DiagnosisDao.createCholesteatomaDiagnosis(data, endoscopyImageFile).then(async savedDiagnosis => {
    //     await cholesteatomaIdentification(savedDiagnosis._id.toString(), endoscopyImageFile).then(updatedDiagnosis => {
    //         res.sendSuccess(updatedDiagnosis, "Cholesteatoma diagnosis saved successfully!");
    //     });
    // }).catch(next);
}

export async function cholesteatomaIdentification(diagnosisId: string, endoscopyImageFile: Express.Multer.File) {
    try {
        const formData = new FormData();
        const fileBlob = new Blob([endoscopyImageFile.buffer], { type: endoscopyImageFile.mimetype });
        formData.append("file", fileBlob, endoscopyImageFile.filename);

        const dlModelResponse = await axios.post(env.FLASK_SERVER_URL, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        if (dlModelResponse.status && dlModelResponse.data) {
            AppLogger.info(`Fetched cholesteatoma identification results from DL model`);

            const diagnosisResults: Partial<DCholesteatoma> = {
                status: dlModelResponse.data.status, // diagnosed or failed
                diagnosisResult: {
                    isCholesteatoma: dlModelResponse.data.isCholesteatoma,
                    stage: dlModelResponse.data.stage,
                    suggestions: dlModelResponse.data.suggestions,
                }
            };

            return await DiagnosisDao.updateCholesteatomaDiagnosis(diagnosisId, diagnosisResults);
        } else {
            AppLogger.error(`Failed to retrieve diagnosis results from the DL model`);
            throw new Error("Failed to retrieve diagnosis results from the DL model.");
        }
    } catch (error) {
        throw error;
    }
}

export async function cholesteatomaDiagnosisAccept(req: Request, res: Response, next: NextFunction) {

    const {accept, diagnosisId} = req.body;

    if (accept === undefined || !diagnosisId) {
        return res.status(400).send({
            message: "Acceptance status and Diagnosis id required.",
        });
    }

    const data: Partial<DCholesteatoma> = {
        accepted: accept,
    }

    await DiagnosisDao.updateCholesteatomaDiagnosis(diagnosisId, data).then(async updatedDiagnosis => {
        res.sendSuccess(updatedDiagnosis, "Cholesteatoma diagnosis acceptance saved successfully!");
    }).catch(next);
}
