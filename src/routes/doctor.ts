import {Express} from 'express';
import * as DiagnosisEp from "../end-points/Cholesteatoma.ep";
import * as SinusitisDiagnosisEp from "../end-points/SinusitisDiagnosis.ep";
import {upload} from "../middleware/upload";
import * as PharyngitisDiagnosisEp from "../end-points/PharyngitisDiagnosis.ep";

export function DoctorRoutesInit(app: Express) {

    /* PUBLIC ROUTES ===================================== */
    app.post('/api/public/diagnosis/cholesteatoma', upload.single("endoscopyImage"), DiagnosisEp.cholesteatomaDiagnosis);
    app.post('/api/public/diagnosis/cholesteatoma/accept', DiagnosisEp.cholesteatomaDiagnosisAccept);
    app.get('/api/public/diagnosis/cholesteatoma/image/:_id', DiagnosisEp.cholesteatomaImage);


    app.post('/api/public/diagnosis/sinusitis', upload.single("watersViewXrayImage"), SinusitisDiagnosisEp.sinusitisDiagnosis);
    app.post('/api/public/diagnosis/sinusitis/accept', SinusitisDiagnosisEp.sinusitisDiagnosisAccept);
    app.get('/api/public/diagnosis/sinusitis/image/:_id', SinusitisDiagnosisEp.sinusitisImage);

    app.post('/api/public/diagnosis/pharyngitis', upload.single("throatImage"), PharyngitisDiagnosisEp.pharyngitisDiagnosis);
    app.post('/api/public/diagnosis/pharyngitis/accept', PharyngitisDiagnosisEp.pharyngitisDiagnosisAccept);
    app.get('/api/public/diagnosis/pharyngitis/image/:_id', PharyngitisDiagnosisEp.pharyngitisImage);


    /* AUTH ROUTES ===================================== */
    app.post('/api/doctor/diagnosis/cholesteatoma', upload.single("endoscopyImage"), DiagnosisEp.cholesteatomaDiagnosis);
    app.post('/api/doctor/diagnosis/cholesteatoma/accept', DiagnosisEp.cholesteatomaDiagnosisAccept);
    app.get('/api/doctor/diagnosis/cholesteatoma/reports', DiagnosisEp.cholesteatomaReports);
    app.get('/api/doctor/diagnosis/cholesteatoma', DiagnosisEp.cholesteatoma);


    app.post('/api/doctor/diagnosis/sinusitis', upload.single("watersViewXrayImage"), SinusitisDiagnosisEp.sinusitisDiagnosis);
    app.post('/api/doctor/diagnosis/sinusitis/accept', SinusitisDiagnosisEp.sinusitisDiagnosisAccept);
    app.get('/api/doctor/diagnosis/sinusitis/reports', SinusitisDiagnosisEp.sinusitisReports);
    app.get('/api/doctor/diagnosis/sinusitis', SinusitisDiagnosisEp.sinusitis);


    app.post('/api/doctor/diagnosis/pharyngitis', upload.single("throatImage"), PharyngitisDiagnosisEp.pharyngitisDiagnosis);
    app.post('/api/doctor/diagnosis/pharyngitis/accept', PharyngitisDiagnosisEp.pharyngitisDiagnosisAccept);
    app.get('/api/doctor/diagnosis/pharyngitis/reports', PharyngitisDiagnosisEp.pharyngitisReports);
    app.get('/api/doctor/diagnosis/pharyngitis', PharyngitisDiagnosisEp.pharyngitis);

}
