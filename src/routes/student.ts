import {Express} from 'express';
import * as DiagnosisEp from "../end-points/CholesteatomaDiagnosis.ep";
import * as SinusitisDiagnosisEp from "../end-points/SinusitisDiagnosis.ep";
import {upload} from "../middleware/upload";
import * as PharyngitisDiagnosisEp from "../end-points/PharyngitisDiagnosis.ep";


export function StudentRoutesInit(app: Express) {

    // CHOLESTEATOMA ROUTES
    app.post('/api/student/diagnosis/cholesteatoma', upload.single("endoscopyImage"), DiagnosisEp.cholesteatomaDiagnosis);
    app.post('/api/student/diagnosis/cholesteatoma/accept', DiagnosisEp.cholesteatomaDiagnosisAccept);
    app.get('/api/student/diagnosis/cholesteatoma/image/:_id', DiagnosisEp.cholesteatomaImage);

    // SINUSITIS ROUTES
    app.post('/api/student/diagnosis/sinusitis', upload.single("watersViewXrayImage"), SinusitisDiagnosisEp.sinusitisDiagnosis);
    app.post('/api/student/diagnosis/sinusitis/accept', SinusitisDiagnosisEp.sinusitisDiagnosisAccept);
    app.get('/api/student/diagnosis/sinusitis/image/:_id', SinusitisDiagnosisEp.sinusitisImage);

    // PHARYNGITIS ROUTES
    app.post('/api/student/diagnosis/pharyngitis', upload.single("throatImage"), PharyngitisDiagnosisEp.pharyngitisDiagnosis);
    app.post('/api/student/diagnosis/pharyngitis/accept', PharyngitisDiagnosisEp.pharyngitisDiagnosisAccept);
    app.get('/api/student/diagnosis/pharyngitis/image/:_id', PharyngitisDiagnosisEp.pharyngitisImage);

}