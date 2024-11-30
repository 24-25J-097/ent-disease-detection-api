import {Express} from 'express';
import * as DiagnosisEp from "../end-points/Diagnosis.ep";
import {upload} from "../middleware/upload";

export function DoctorRoutesInit(app: Express) {

    /* PUBLIC ROUTES ===================================== */

    /* AUTH ROUTES ===================================== */
    app.post('/api/doctor/diagnosis/cholesteatoma',  upload.single("endoscopyImage"), DiagnosisEp.cholesteatomaDiagnosis);

}
