import {Express} from 'express';
import * as UserEp from "../end-points/User.ep";
import * as PatientEp from "../end-points/Patient.ep";
import * as UserPlanEp from "../end-points/UserPlan.ep";

export function AuthRoutesInit(app: Express) {

    /* AUTH ROUTES ===================================== */
    app.get('/api/auth/me', UserEp.getSelf);
    app.put('/api/auth/me', UserEp.updateUserValidationRules(true), UserEp.updateSelf);
    app.delete('/api/auth/me', UserEp.deactivate);


    app.get('/api/auth/patients', PatientEp.filterPatients);

    /* PRICING ROUTES ===================================== */

    // Get active plan for current user
    app.get("/api/auth/active-plan", UserPlanEp.getActivePlan);
    // Get all plans for current user
    app.get("/api/auth/my-plans", UserPlanEp.getUserPlans);
    // Purchase a package
    app.post("/api/auth/purchase-package", UserPlanEp.purchasePackage);
    // Cancel a plan
    app.delete("/api/auth/cancel-plan/:id", UserPlanEp.cancelUserPlan);
}
