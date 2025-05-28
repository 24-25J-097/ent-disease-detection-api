import nodemailer from 'nodemailer';
import fs from 'fs';
import {AppEmailOptions, ContactUsEmailData, EmailNotificationData, EmailOptions} from "../types/util-types";
import env from "../utils/validate-env";
import {AppLogger, ErrorLogger} from "../utils/logging";
import {EmailType} from "../enums/util";
import {
    extractTextFromHtml,
    generateMessageId,
    getDomainFromEmail,
    getFromAddress,
    isValidEmail,
    shouldRetry
} from "./email-helpers";
import {getNotificationMail} from "./get-notification-mail";
import {getContactUsMail} from "./get-contact-us-mail";

enum EmailService {
    GMAIL = 'gmail',
    CUSTOM = 'custom'
}

// Email configuration factory
function createEmailConfig() {
    const service = (env.EMAIL_SERVICE).toLowerCase() as EmailService;

    switch (service) {
        case EmailService.GMAIL:
            return {
                service: 'Gmail',
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                auth: {
                    user: env.APP_GMAIL,
                    pass: env.APP_GMAIL_PSWD
                },
                tls: {
                    rejectUnauthorized: true
                }
            };

        case EmailService.CUSTOM:
            return {
                host: env.APP_EMAIL_HOST,
                port: parseInt(env.APP_EMAIL_PORT.toString() || '587'), // when SSL -> 465
                secure: env.APP_EMAIL_SECURE, // when SSL -> true
                auth: {
                    user: env.APP_EMAIL_USER,
                    pass: env.APP_EMAIL_PASSWORD
                },
                tls: {
                    ciphers: 'TLSv1.2',  // better than SSLv3 (which is deprecated)
                    rejectUnauthorized: true
                }
            };

        default:
            throw new Error(`Unsupported email service: ${service}`);
    }
}

// Common transporter options
const TRANSPORTER_OPTIONS = {
    connectionTimeout: parseInt(env.EMAIL_CONNECTION_TIMEOUT.toString() || '10000'),
    greetingTimeout: parseInt(env.EMAIL_GREETING_TIMEOUT.toString() || '5000'),
    socketTimeout: parseInt(env.EMAIL_SOCKET_TIMEOUT.toString() || '30000'),
    pool: env.EMAIL_POOL_ENABLED,
    maxConnections: parseInt(env.EMAIL_MAX_CONNECTIONS.toString() || '5'),
    maxMessages: parseInt(env.EMAIL_MAX_MESSAGES.toString() || '100'),
    rateLimit: parseInt(env.EMAIL_RATE_LIMIT.toString() || '5') // emails per second
};

const config = createEmailConfig();
const transporter = nodemailer.createTransport({
    ...config,
    ...TRANSPORTER_OPTIONS
});

const createTransporter = () => {
    // Verify transporter configuration on startup
    transporter.verify((error: Error | null, success: boolean) => {
        if (error) {
            ErrorLogger.error('Email transporter verification failed:', error);
        } else {
            const service = env.EMAIL_SERVICE;
            AppLogger.info(`Email transporter (${service.toUpperCase()}) is ready to send emails`);
        }
    });
    return transporter;
};

const EmailTransporter = createTransporter();

export async function sendEmail(options: AppEmailOptions): Promise<boolean> {
    try {
        // Validate email address format
        if (!isValidEmail(options.to?.toString() || "")) {
            throw new Error(`Invalid email address: ${options.to}`);
        }

        const mailOptions = await getEmailContent(options);
        const result = await EmailTransporter.sendMail(mailOptions);
        AppLogger.info(`Successfully sent email to ${options.to} [MessageId: ${result.messageId}]`);
        return true;
    } catch (error) {
        AppLogger.error(`Email sending failed to ${options.to}`);
        ErrorLogger.error('Error sending email:', error);

        // Implement retry logic for transient failures
        if (shouldRetry(error)) {
            AppLogger.info(`Retrying email send to ${options.to}`);
            return await retryEmailSend(options, 1);
        }
        return false;
    }
}

export async function sendEmailNotification(options: AppEmailOptions, data: EmailNotificationData | ContactUsEmailData): Promise<boolean> {
    try {
        // Validate email address format
        if (!isValidEmail(options.to?.toString() || "")) {
            throw new Error(`Invalid email address: ${options.to}`);
        }

        const mailOptions = await getEmailContent(options, data);
        const result = await EmailTransporter.sendMail(mailOptions);

        AppLogger.info(`Successfully sent notification email to ${options.to} [MessageId: ${result.messageId}] [Result: ${result.response}`);
        return true;
    } catch (error) {
        AppLogger.error(`Email notification sending failed to ${options.to}`);
        ErrorLogger.error('Error sending email notification:', error);

        // Implement retry logic for transient failures
        if (shouldRetry(error)) {
            AppLogger.info(`Retrying notification email send to ${options.to}`);
            return await retryEmailNotificationSend(options, data, 1);
        }
        return false;
    }
}

async function getEmailContent(options: AppEmailOptions, data?: EmailNotificationData | ContactUsEmailData): Promise<EmailOptions> {
    let htmlContent: Buffer | null = null;
    let htmlString = '';
    let subject = '';
    const brandName = env.EMAIL_BRAND_NAME || 'ENT Insight';

    try {
        switch (options.type) {
            case EmailType.WELCOME:
                htmlContent = await readHTMLFile('welcome.html');
                subject = `Welcome to ${brandName}`;
                break;
            case EmailType.CREATE_USER:
                htmlContent = await readHTMLFile('create_user.html');
                subject = `User Account Created - ${brandName}`;
                break;
            case EmailType.DEACTIVATE_USER:
                htmlContent = await readHTMLFile('deactivate_user.html');
                subject = `User Account Deactivated - ${brandName}`;
                break;
            case EmailType.NOTIFICATION:
                if (!data) {
                    throw new Error('Notification data is required for notification emails');
                }
                htmlString = getNotificationMail(data as EmailNotificationData);
                subject = `Notification: ${data.subject} - ${brandName}`;
                break;
            case EmailType.CONTACT_US:
                if (!data) {
                    throw new Error('Notification data is required for contact us emails');
                }
                htmlString = getContactUsMail(data as ContactUsEmailData);
                subject = `Notification: ${data.subject} - ${brandName}`;
                break;
            default:
                throw new Error(`Invalid email type: ${options.type}`);
        }

        const fromAddress = getFromAddress();

        return {
            from: {
                name: brandName,
                address: fromAddress
            },
            to: options.to,
            subject: subject,
            html: htmlContent ?? htmlString,
            // Add text fallback for better compatibility
            text: extractTextFromHtml((htmlContent ?? htmlString).toString()),
            // Add headers for better deliverability
            headers: {
                'X-Mailer': `${brandName} System`,
                'X-Priority': '3',
                'List-Unsubscribe': `<mailto:unsubscribe@${getDomainFromEmail(fromAddress)}>`,
                'Return-Path': fromAddress
            },
            // Add message tracking
            messageId: generateMessageId(),
            replyTo: fromAddress
            // Add reply-to if different from sender
            // replyTo: env.EMAIL_REPLY_TO || fromAddress
        };
    } catch (error) {
        ErrorLogger.error('Error generating email content:', error);
        throw new Error(`Failed to generate email content for type: ${options.type}`);
    }
}

async function readHTMLFile(file: string): Promise<Buffer> {
    const templatePath = './src/templates/html';
    const fullPath = `${templatePath}/${file}`;
    return new Promise((resolve, reject) => {
        fs.readFile(fullPath, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

async function retryEmailSend(options: AppEmailOptions, attempt: number): Promise<boolean> {
    const maxRetries = parseInt(env.EMAIL_MAX_RETRIES.toString() || '3');
    const retryDelay = parseInt(env.EMAIL_RETRY_DELAY.toString() || '5000'); // 5 seconds

    if (attempt > maxRetries) {
        AppLogger.error(`Max retries (${maxRetries}) reached for email to ${options.to}`);
        return false;
    }

    await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));

    try {
        const mailOptions = await getEmailContent(options);
        const result = await EmailTransporter.sendMail(mailOptions);
        AppLogger.info(`Email sent successfully on retry ${attempt} to ${options.to} [MessageId: ${result.messageId}]`);
        return true;
    } catch (error) {
        ErrorLogger.error(`Retry ${attempt} failed for email to ${options.to}:`, error);
        if (shouldRetry(error)) {
            return await retryEmailSend(options, attempt + 1);
        }
        return false;
    }
}

async function retryEmailNotificationSend(options: AppEmailOptions, data: EmailNotificationData | ContactUsEmailData, attempt: number): Promise<boolean> {
    const maxRetries = parseInt(env.EMAIL_MAX_RETRIES.toString() || '3');
    const retryDelay = parseInt(env.EMAIL_RETRY_DELAY.toString() || '5000');

    if (attempt > maxRetries) {
        AppLogger.error(`Max retries (${maxRetries}) reached for notification email to ${options.to}`);
        return false;
    }

    await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));

    try {
        const mailOptions = await getEmailContent(options, data);
        const result = await EmailTransporter.sendMail(mailOptions);
        AppLogger.info(`Notification email sent successfully on retry ${attempt} to ${options.to} [MessageId: ${result.messageId}]`);
        return true;
    } catch (error) {
        ErrorLogger.error(`Retry ${attempt} failed for notification email to ${options.to}:`, error);
        if (shouldRetry(error)) {
            return await retryEmailNotificationSend(options, data, attempt + 1);
        }
        return false;
    }
}

// Graceful shutdown
process.on('SIGTERM', () => {
    EmailTransporter.close();
    AppLogger.info('Email transporter closed');
});

process.on('SIGINT', () => {
    EmailTransporter.close();
    AppLogger.info('Email transporter closed');
});
