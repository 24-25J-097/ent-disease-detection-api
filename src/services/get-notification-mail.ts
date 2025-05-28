import {EmailNotificationData} from "../types/util-types";
import env from "../utils/validate-env";
import {sanitizeHtml} from "./email-helpers";

export function getNotificationMail(data: EmailNotificationData): string {
    // Sanitize data to prevent XSS
    const sanitizedData = {
        user: {
            name: sanitizeHtml(data.user.name)
        },
        subject: sanitizeHtml(data.subject),
        message: sanitizeHtml(data.message)
    };

    const brandName = env.EMAIL_BRAND_NAME || 'ENT Insight';

    return `<!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>${brandName} Notification</title>
                    <style>
                        /* Reset and base styles */
                        * {
                            margin: 0;
                            padding: 0;
                            box-sizing: border-box;
                        }
                
                        body {
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                            line-height: 1.6;
                            color: #333333;
                            background-color: #f8fafc;
                            margin: 0;
                            padding: 40px 20px;
                            width: 100% !important;
                            -webkit-text-size-adjust: 100%;
                            -ms-text-size-adjust: 100%;
                        }
                
                        /* Container styles */
                        .email-container {
                            max-width: 1080px;
                            margin: 0 auto;
                            background-color: #ffffff;
                            border-radius: 12px;
                            overflow: hidden;
                            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
                        }
                
                        /* Header styles */
                        .header {
                            background: linear-gradient(135deg, #5089e5  0%, #8e24aa  100%);
                            padding: 40px 30px;
                            text-align: center;
                            position: relative;
                            overflow: hidden;
                        }
                
                        .header::before {
                            content: '';
                            position: absolute;
                            top: -50%;
                            left: -50%;
                            width: 200%;
                            height: 200%;
                            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/><circle cx="20" cy="80" r="0.5" fill="white" opacity="0.1"/><circle cx="80" cy="30" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
                        }
                
                        .header-title {
                            color: white;
                            font-size: 28px;
                            font-weight: 700;
                            margin: 0 0 5px 0;
                            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                            position: relative;
                        }
                
                        .header-subtitle {
                            color: rgba(255, 255, 255, 0.9);
                            font-size: 16px;
                            margin: 0;
                            position: relative;
                        }
                
                        /* Content styles */
                        .content {
                            padding: 40px;
                        }
                
                        .greeting {
                            font-size: 18px;
                            color: #4a5568;
                            margin-bottom: 25px;
                            line-height: 1.8;
                        }
                
                        .notification-box {
                            background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
                            border-left: 4px solid #5089e5;
                            padding: 25px;
                            border-radius: 8px;
                            margin: 30px 0;
                            position: relative;
                            overflow: hidden;
                        }
                
                        .notification-box::before {
                            content: '';
                            position: absolute;
                            top: 0;
                            right: 0;
                            width: 100px;
                            height: 100px;
                            background: radial-gradient(circle, rgba(102, 126, 234, 0.1) 0%, transparent 70%);
                            transform: translate(50%, -50%);
                        }
                
                        .notification-title {
                            font-size: 20px;
                            color: #5089e5;
                            margin: 0 0 15px 0;
                            font-weight: 600;
                        }
                
                        .notification-message {
                            font-size: 16px;
                            color: #4a5568;
                            line-height: 1.6;
                            margin: 0;
                        }
                
                        /* Button styles */
                        .cta-section {
                            text-align: center;
                            margin: 40px 0 30px 0;
                        }
                
                        .cta-button {
                            display: inline-block;
                            background: linear-gradient(135deg, #5089e5 0%, #8e24aa 100%);
                            color: white;
                            text-decoration: none;
                            padding: 16px 32px;
                            border-radius: 50px;
                            font-weight: 600;
                            font-size: 16px;
                            transition: all 0.3s ease;
                            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                            position: relative;
                            overflow: hidden;
                        }
                
                        .cta-button:hover {
                            transform: translateY(-2px);
                            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
                        }
                
                        /* Footer styles */
                        .footer {
                            background: #f7fafc;
                            padding: 30px 40px;
                            text-align: center;
                            border-top: 1px solid #e2e8f0;
                        }
                
                        .footer-text {
                            color: #718096;
                            font-size: 14px;
                            margin-bottom: 15px;
                            line-height: 1.6;
                        }
                
                        .team-name {
                            font-size: 16px;
                            font-weight: 600;
                            color: #2d3748;
                            margin-bottom: 5px;
                        }
                
                        .unsubscribe-link {
                            color: #718096;
                            font-size: 12px;
                            text-decoration: none;
                        }
                
                        /* Responsive styles */
                        @media only screen and (max-width: 600px) {
                            body {
                                padding: 20px 10px;
                            }
                            
                            .email-container {
                                border-radius: 8px;
                            }
                
                            .header {
                                padding: 30px 20px;
                            }
                
                            .header-title {
                                font-size: 24px;
                            }
                
                            .content {
                                padding: 30px 20px;
                            }
                
                            .footer {
                                padding: 25px 20px;
                            }
                
                            .cta-button {
                                padding: 14px 28px;
                                font-size: 15px;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="email-container">
                        <!-- Header Section -->
                        <div class="header">
                            <h1 class="header-title">${brandName}</h1>
                            <p class="header-subtitle">Notification Center</p>
                        </div>
                
                        <!-- Main Content -->
                        <div class="content">
                            <p class="greeting">
                                <strong>Dear ${sanitizedData.user.name},</strong>
                            </p>
                
                            <p class="greeting">
                                You have an important notification from ${brandName}:
                            </p>
                
                            <div class="notification-box">
                                <h3 class="notification-title">${sanitizedData.subject}</h3>
                                <p class="notification-message">${sanitizedData.message}</p>
                            </div>
                
                            ${env.EMAIL_LOGIN_URL ? `
                            <div class="cta-section">
                                <a href="${env.EMAIL_LOGIN_URL}" class="cta-button">View in ${brandName}</a>
                            </div>
                            ` : ''}
                
                            <p class="greeting">
                                This notification was sent to your email address as part of your ${brandName} account.
                                ${!env.EMAIL_LOGIN_URL ? 'Please log in to your account for more details.' : ''}
                            </p>
                        </div>
                
                        <!-- Footer Section -->
                        <div class="footer">
                            <p class="team-name">The ${brandName} Team</p>
                            <p class="footer-text">
                                This is an automated message. Please do not reply directly to this email.
                            </p>
                            ${env.EMAIL_UNSUBSCRIBE_URL ? `
                            <p class="footer-text">
                                <a href="${env.EMAIL_UNSUBSCRIBE_URL}" class="unsubscribe-link">Unsubscribe from these notifications</a>
                            </p>
                            ` : ''}
                            <p class="footer-text" style="font-size: 12px; margin-top: 20px;">
                                © ${new Date().getFullYear()} ${brandName}. All rights reserved.
                            </p>
                        </div>
                    </div>
                </body>
            </html>`;
}
