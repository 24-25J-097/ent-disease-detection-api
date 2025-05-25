import {Express} from 'express';
import * as UserEp from "../end-points/User.ep";
import * as PatientEp from "../end-points/Patient.ep";
import * as PackageEp from "../end-points/Package.ep";
import * as ReportEp from "../end-points/Report.ep";
import * as RoleAccessPolicyEp from "../end-points/RoleAccessPolicy.ep";
import * as UserPlanEp from "../end-points/UserPlan.ep";

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

    // Plans
    app.get("/admin/packages/", PackageEp.getAllPackages);
    app.post("/admin/packages/", PackageEp.createPackage);
    app.get("/admin/packages/:id", PackageEp.getPackageById);
    app.put("/admin/packages/:id", PackageEp.updatePackage);
    app.delete("/admin/packages/:id", PackageEp.deletePackage);
    app.patch("/admin/packages/:id/status", PackageEp.setPackageStatus);

    // packages Reports
    app.get("/admin/reports/plans/api-usage/by-user", ReportEp.getApiUsageByUser);
    app.get("/admin/reports/plans/api-usage/by-endpoint", ReportEp.getApiUsageByEndpoint);
    app.get("/admin/reports/plans/purchase-history", ReportEp.getPurchaseHistory);
    app.get("/admin/reports/plans/user-plans/status", ReportEp.getUserPlanStatus);
    app.get("/admin/reports/plans/user/:userId/api-usage", ReportEp.getUserApiUsage);

    // Role access policies
    app.get("/admin/role-access-policies/", RoleAccessPolicyEp.getAllPolicies);
    app.post("/admin/role-access-policies/initialize", RoleAccessPolicyEp.initializePolicies);
    app.post("/admin/role-access-policies/reset", RoleAccessPolicyEp.resetPolicies);
    app.get("/admin/role-access-policies/:role", RoleAccessPolicyEp.getPolicyByRole);
    app.put("/admin/role-access-policies/:role", RoleAccessPolicyEp.updatePolicy);
    app.get("/admin/role-access-policies/:role/has-unlimited-access", RoleAccessPolicyEp.hasUnlimitedAccess);
    app.get("/admin/role-access-policies/:role/requires-package", RoleAccessPolicyEp.requiresPackage);

    // User Purchased Packages
    app.get("/admin/purchased-plans/", UserPlanEp.getAllUserPlans);
    app.post("/admin/purchased-plans/", UserPlanEp.createUserPlan);
    app.get("/admin/purchased-plans/expired", UserPlanEp.getExpiredPlans);
    app.post("/admin/purchased-plans/deactivate-expired", UserPlanEp.deactivateExpiredPlans);
    app.get("/admin/purchased-plans/user/:userId", UserPlanEp.getUserPlans);
    app.get("/admin/purchased-plans/:id", UserPlanEp.getUserPlanById);
    app.put("/admin/purchased-plans/:id", UserPlanEp.updateUserPlan);
    app.delete("/admin/purchased-plans/:id", UserPlanEp.cancelUserPlan);
}