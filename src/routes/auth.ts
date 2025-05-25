import {Express} from 'express';
import * as UserEp from "../end-points/User.ep";
import * as PatientEp from "../end-points/Patient.ep";
import * as UserPlanEp from "../end-points/UserPlan.ep";

export function AuthRoutesInit(app: Express) {

    /* PUBLIC ROUTES ===================================== */
    app.post('/api/public/tester', UserEp.authenticateValidationRules(), UserEp.tester);

    app.post('/api/public/login', UserEp.authenticateValidationRules(), UserEp.loginUser);
    app.post('/api/public/register', UserEp.registerValidationRules(), UserEp.registerUser);
    // app.post('/api/public/forgot-password', UserEp.forgotPasswordValidationRules(), UserEp.forgotPassword);
    // app.post('/api/public/reset-password', UserEp.resetPasswordValidationRules(), UserEp.resetPassword);
    // app.get('/api/public/token-validate/:token', UserEp.tokenValidationRules(), UserEp.tokenValidate);
    // app.get('/api/public/logout', UserEp.logout);

    app.post('/api/public/student/login', UserEp.authenticateValidationRules(), UserEp.loginStudent);
    app.post('/api/public/student/register', UserEp.studentRegisterValidationRules(), UserEp.registerUser);

    /* AUTH ROUTES ===================================== */
    app.get('/api/auth/me', UserEp.getSelf);
    app.put('/api/auth/me', UserEp.updateUserValidationRules(true), UserEp.updateSelf);
    app.delete('/api/auth/me', UserEp.deactivate);


    app.get('/api/auth/patients', PatientEp.filterPatients);

    /* PRICING ROUTES ===================================== */

    // Get active plan for current user
    app.get("/active-plan", UserPlanEp.getActivePlan);
    // Get all plans for current user
    app.get("/my-plans", UserPlanEp.getUserPlans);
    // Purchase a package
    app.post("/purchase-package", UserPlanEp.purchasePackage);
    // Cancel a plan
    app.delete("/cancel-plan/:id", UserPlanEp.cancelUserPlan);
}
