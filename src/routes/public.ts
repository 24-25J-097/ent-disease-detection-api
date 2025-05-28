import {Express} from 'express';
import * as UserEp from "../end-points/User.ep";
import * as PackageEp from "../end-points/Package.ep";

export function PublicRoutesInit(app: Express) {

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

    /* PRICING ROUTES  ===================================== */
    // Plans
    app.get("/api/public/packages", PackageEp.getAllPackages);
}
