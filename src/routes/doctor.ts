import {Express} from 'express';
import * as DiagnosisEp from "../end-points/Diagnosis.ep";
import * as SinusitisDiagnosisEp from "../end-points/SinusitisDiagnosis.ep";
import {upload} from "../middleware/upload";

export function DoctorRoutesInit(app: Express) {

    /* PUBLIC ROUTES ===================================== */
    app.post('/api/public/diagnosis/cholesteatoma',  upload.single("endoscopyImage"), DiagnosisEp.cholesteatomaDiagnosis);
    app.post('/api/public/diagnosis/cholesteatoma/accept', DiagnosisEp.cholesteatomaDiagnosisAccept);


    app.post('/api/public/diagnosis/sinusitis',  upload.single("watersViewXrayImage"), SinusitisDiagnosisEp.sinusitisDiagnosis);
    app.post('/api/public/diagnosis/sinusitis/accept', SinusitisDiagnosisEp.sinusitisDiagnosisAccept);

    /* AUTH ROUTES ===================================== */
    app.post('/api/doctor/diagnosis/cholesteatoma',  upload.single("endoscopyImage"), DiagnosisEp.cholesteatomaDiagnosis);
    app.post('/api/doctor/diagnosis/cholesteatoma/accept', DiagnosisEp.cholesteatomaDiagnosisAccept);


    app.post('/api/doctor/diagnosis/sinusitis',  upload.single("watersViewXrayImage"), SinusitisDiagnosisEp.sinusitisDiagnosis);
    app.post('/api/doctor/diagnosis/sinusitis/accept', SinusitisDiagnosisEp.sinusitisDiagnosisAccept);

}
