import {Express} from 'express';
import * as UserEp from "../end-points/User.ep";
import * as PatientEp from "../end-points/Patient.ep";

export function AdminRoutesInit(app: Express) {

    /* PUBLIC ROUTES ===================================== */

    /* AUTH ROUTES ===================================== */
    app.get('/api/admin/users', UserEp.getAll);
    app.get('/api/admin/users/:_id', UserEp.fetchUserValidationRules(), UserEp.getUser);
    app.put('/api/admin/users/:_id', UserEp.updateUserValidationRules(false), UserEp.update);
    app.delete('/api/admin/users/:_id', UserEp.fetchUserValidationRules(), UserEp.destroy);

    // Get all patients (admin and doctor only)
    app.get('/api/admin/patients', PatientEp.getAllPatients);
    app.get('/api/admin/patients/:id', PatientEp.getPatient);
    app.put('/api/admin/patients/:id', PatientEp.updatePatient);
    app.delete('/api/admin/patients/:id', PatientEp.deletePatient);

}
