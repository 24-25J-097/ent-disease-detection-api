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
    app.get("/api/admin/packages", PackageEp.getAllPackages);
    app.post("/api/admin/packages", PackageEp.createPackage);
    app.patch("/api/admin/packages/:id/status", PackageEp.setPackageStatus);
    app.get("/api/admin/packages/:id", PackageEp.getPackageById);
    app.put("/api/admin/packages/:id", PackageEp.updatePackage);
    app.delete("/api/admin/packages/:id", PackageEp.deletePackage);

    // Role access policies
    app.get("/api/admin/role-access-policies", RoleAccessPolicyEp.getAllPolicies);
    app.post("/api/admin/role-access-policies/initialize", RoleAccessPolicyEp.initializePolicies);
    app.post("/api/admin/role-access-policies/reset", RoleAccessPolicyEp.resetPolicies);
    app.get("/api/admin/role-access-policies/:role", RoleAccessPolicyEp.getPolicyByRole);
    app.put("/api/admin/role-access-policies/:role", RoleAccessPolicyEp.updatePolicy);
    app.get("/api/admin/role-access-policies/:role/has-unlimited-access", RoleAccessPolicyEp.hasUnlimitedAccess);
    app.get("/api/admin/role-access-policies/:role/requires-package", RoleAccessPolicyEp.requiresPackage);

    // User Purchased Packages
    app.get("/api/admin/purchased-plans", UserPlanEp.getAllUserPlans);
    app.post("/api/admin/purchased-plans", UserPlanEp.createUserPlan);
    app.get("/api/admin/purchased-plans/expired", UserPlanEp.getExpiredPlans);
    app.post("/api/admin/purchased-plans/deactivate-expired", UserPlanEp.deactivateExpiredPlans);
    app.get("/api/admin/purchased-plans/user/:userId", UserPlanEp.getUserPlans);
    app.get("/api/admin/purchased-plans/:id", UserPlanEp.getUserPlanById);
    app.put("/api/admin/purchased-plans/:id", UserPlanEp.updateUserPlan);
    app.delete("/api/admin/purchased-plans/:id", UserPlanEp.cancelUserPlan);

    // packages Reports
    app.get("/api/admin/reports/plans/purchase-history", ReportEp.getPurchaseHistory);
    app.get("/api/admin/reports/plans/api-usage", ReportEp.getAllUsage);
    app.get("/api/admin/reports/plans/api-usage/:userId", ReportEp.getUserApiUsage);
    app.get("/api/admin/reports/plans/api-usage/by-user", ReportEp.getApiUsageByUser);
    app.get("/api/admin/reports/plans/api-usage/by-endpoint", ReportEp.getApiUsageByEndpoint);
    app.get("/api/admin/reports/plans/status", ReportEp.getUserPlanStatus);

}