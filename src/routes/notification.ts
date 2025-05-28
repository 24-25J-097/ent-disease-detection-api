import {Express} from 'express';
import * as NotificationEp from "../end-points/Notification.ep";

export function NotificationRoutesInit(app: Express) {

    // Route to handle email notifications from the frontend contact form
    app.post('/api/public/notification/contact-us', NotificationEp.sendContactEmailNotification);

}
