import {Express} from 'express';
import * as DiagnosisEp from "../end-points/Diagnosis.ep";
import {upload} from "../middleware/upload";

export function DoctorRoutesInit(app: Express) {

    /* PUBLIC ROUTES ===================================== */
    app.post('/api/public/diagnosis/cholesteatoma',  upload.single("endoscopyImage"), DiagnosisEp.cholesteatomaDiagnosis);
    app.post('/api/public/diagnosis/cholesteatoma/accept', DiagnosisEp.cholesteatomaDiagnosisAccept);

    /* AUTH ROUTES ===================================== */
    app.post('/api/doctor/diagnosis/cholesteatoma',  upload.single("endoscopyImage"), DiagnosisEp.cholesteatomaDiagnosis);
    app.post('/api/doctor/diagnosis/cholesteatoma/accept', DiagnosisEp.cholesteatomaDiagnosisAccept);
    app.get('/api/doctor/diagnosis/cholesteatoma/reports', DiagnosisEp.cholesteatomaReports);

}
