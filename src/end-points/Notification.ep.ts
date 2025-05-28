import {Request, Response} from 'express';
import {sendEmailNotification} from "../services/email.service";
import {AppLogger, ErrorLogger} from "../utils/logging";
import {EmailType} from "../enums/util";

export async function sendContactEmailNotification(req: Request, res: Response) {
    const {
        name,
        email,
        message,
        phone = 'N/A',
        subject = 'Contact Form Submission',
        additionalInfo = 'N/A',
        submissionTime,
        ipAddress,
        domain
    } = req.body;

    if (!name || !email || !message || !submissionTime || !ipAddress || !domain) {
        AppLogger.error(`Required fields are missing.`);
        return res.sendError('Name, email, message, submissionTime, ipAddress, and domain are all required.', 400);
    }

    try {
        await sendEmailNotification(
            {
                type: EmailType.CONTACT_US,
                to: process.env.APP_CONTACT_RECEIVER_EMAIL!,
            },
            {
                name,
                email,
                message,
                phone,
                subject,
                additionalInfo,
                submissionTime: submissionTime || new Date().toISOString(),
                ipAddress: ipAddress || req.ip?.toString() || 'N/A',
                domain: domain || req.headers.origin || req.headers.host || 'unknown',
            }
        );

        res.sendSuccess(null, "Email sent successfully!");
    } catch (error) {
        ErrorLogger.error('Email send error:', error);
        res.sendError("Failed to send email. Please try again later.", 500);
    }
}
