import {Express} from 'express';
import * as UserEp from "../end-points/User.ep";

export function AdminRoutesInit(app: Express) {

    /* PUBLIC ROUTES ===================================== */

    /* AUTH ROUTES ===================================== */
    app.get('/api/admin/users', UserEp.getAll);
    app.get('/api/admin/users/:_id', UserEp.fetchUserValidationRules(), UserEp.getUser);
    app.put('/api/admin/users/:_id', UserEp.updateUserValidationRules(false), UserEp.update);
    app.delete('/api/admin/users/:_id', UserEp.fetchUserValidationRules(), UserEp.destroy);

}
