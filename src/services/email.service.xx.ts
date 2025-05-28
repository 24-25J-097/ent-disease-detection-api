// import nodemailer from 'nodemailer';
// import fs from 'fs';
// import {AppEmailOptions, EmailNotificationData, EmailOptions} from "../types/util-types";
// import env from "../utils/validate-env";
// import {AppLogger, ErrorLogger} from "../utils/logging";
// import {EmailType} from "../enums/util";
//
// // Set email service configuration
// const transporter = nodemailer.createTransport({
//     service: 'Gmail',
//     host: 'smtp.gmail.com',
//     port: 465,
//     secure: true,
//     auth: {
//         user: env.APP_EMAIL,
//         pass: env.APP_EMAIL_PSWD
//     }
// });
//
// export async function sendEmail(options: AppEmailOptions): Promise<void> {
//     try {
//         const mailOptions = await getEmailContent(options);
//         const result = await transporter.sendMail(mailOptions);
//         AppLogger.info(`Successfully sent email to ${options.to} [Result: ${result.response}`);
//     } catch (error) {
//         AppLogger.error(`Email sending failed to ${options.to}`);
//         ErrorLogger.error('Error sending email: ', error);
//         // throw new Error('Failed to send email');
//     }
// }
//
// export async function sendEmailNotification(options: AppEmailOptions, data: EmailNotificationData): Promise<void> {
//     try {
//         const mailOptions = await getEmailContent(options, data);
//         const result = await transporter.sendMail(mailOptions);
//         AppLogger.info(`Successfully sent email to ${options.to} [Result: ${result.response}`);
//     } catch (error) {
//         AppLogger.error(`Email sending failed to ${options.to}`);
//         ErrorLogger.error('Error sending email: ', error);
//         // throw new Error('Failed to send email');
//     }
// }
//
// async function getEmailContent(options: AppEmailOptions, data?: EmailNotificationData): Promise<EmailOptions> {
//     let htmlContent: Buffer | null = null;
//     let htmlString = '';
//     let subject = '';
//
//     switch (options.type) {
//         case EmailType.WELCOME:
//             htmlContent = await readHTMLFile('welcome.html');
//             subject = 'Welcome to ENT Insight';
//             break;
//         case EmailType.CREATE_USER:
//             htmlContent = await readHTMLFile('create_user.html');
//             subject = 'User Account Created';
//             break;
//         case EmailType.DEACTIVATE_USER:
//             htmlContent = await readHTMLFile('deactivate_user.html');
//             subject = 'User Account Deactivated';
//             break;
//         case EmailType.NOTIFICATION:
//             htmlString =  getNotificationMail(data!);
//             subject = 'User Received Notification';
//             break;
//         default:
//             throw new Error('Invalid email type');
//     }
//
//     return {
//         from: env.APP_EMAIL,
//         to: options.to,
//         subject: subject,
//         html: htmlContent ?? htmlString,
//     };
// }
//
// function readHTMLFile(file: string): Promise<Buffer> {
//     const fullPath = `./src/templates/html/${file}`
//     return new Promise((resolve, reject) => {
//         fs.readFile(fullPath, (err, data) => {
//             if (err) {
//                 reject(err);
//             } else {
//                 resolve(data);
//             }
//         });
//     });
// }
//
// function getNotificationMail(data: EmailNotificationData) {
//     return `<!DOCTYPE html>
//             <html lang="en">
//             <head>
//                 <meta charset="UTF-8">
//                 <meta name="viewport" content="width=device-width, initial-scale=1.0">
//                 <title>Notification</title>
//             </head>
//             <body>
//                 <div style="font-family: Arial, sans-serif;">
//                     <h2>Notification</h2>
//                     <p>Dear ${data.user.name},</p>
//                     <p>We would like to inform you about the following:</p>
//                     <ul>
//                         <li><strong>Subject:</strong> ${data.subject}</li>
//                         <li><strong>Message:</strong> ${data.message}</li>
//                     </ul>
//                     <p>Please take note of the above information.</p>
//                     <p>Best regards,<br>Your Organization</p>
//                 </div>
//             </body>
//             </html>`;
// }
