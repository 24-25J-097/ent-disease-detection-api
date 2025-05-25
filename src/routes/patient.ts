import {Express} from 'express';
import * as PatientEp from "../end-points/Patient.ep";
import {Role} from "../enums/auth";
import {verifyRole} from "../middleware/verify-role";

export function PatientRoutesInit(app: Express) {

    /* PUBLIC ROUTES ===================================== */

    /* AUTH ROUTES ===================================== */

}