import env from "../utils/validate-env";
import {sanitizeHtml} from "./email-helpers";
import {ContactUsEmailData} from "../types/util-types";

export function getContactUsMail(data: ContactUsEmailData): string {

    const brandName = env.EMAIL_BRAND_NAME || 'ENT Insight';

    // Sanitize data to prevent XSS
    const sanitizedData = {
        name: sanitizeHtml(data.name),
        email: sanitizeHtml(data.email),
        phone: sanitizeHtml(data.phone),
        subject: sanitizeHtml(data.subject),
        message: sanitizeHtml(data.message),
        additionalInfo: sanitizeHtml(data.additionalInfo),
        submissionTime: sanitizeHtml(data.submissionTime),
        ipAddress: sanitizeHtml(data.ipAddress),
        domain: sanitizeHtml(data.domain),
    };

    return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>New Contact Form Submission | ${brandName}</title>
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
            
                    .message-box {
                        background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
                        border-left: 4px solid #4f46e5;
                        padding: 25px;
                        border-radius: 8px;
                        margin: 30px 0;
                        position: relative;
                        overflow: hidden;
                    }
            
                    .message-box::before {
                        content: '';
                        position: absolute;
                        top: 0;
                        right: 0;
                        width: 100px;
                        height: 100px;
                        background: radial-gradient(circle, rgba(79, 70, 229, 0.1) 0%, transparent 70%);
                        transform: translate(50%, -50%);
                    }
            
                    .message-title {
                        font-size: 20px;
                        color: #4f46e5;
                        margin: 0 0 15px 0;
                        font-weight: 600;
                    }
            
                    .message-details {
                        font-size: 16px;
                        color: #4a5568;
                        line-height: 1.6;
                        margin: 0;
                    }
            
                    .detail-row {
                        margin-bottom: 12px;
                        padding-bottom: 12px;
                        border-bottom: 1px solid #e2e8f0;
                    }
            
                    .detail-row:last-child {
                        margin-bottom: 0;
                        padding-bottom: 0;
                        border-bottom: none;
                    }
            
                    .detail-label {
                        font-weight: 600;
                        color: #2d3748;
                        display: inline-block;
                        min-width: 100px;
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
            
                        .detail-label {
                            display: block;
                            margin-bottom: 4px;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="email-container">
                    <!-- Header Section -->
                    <div class="header">
                        <h1 class="header-title">New Contact Message</h1>
                        <p class="header-subtitle">From your website contact form</p>
                    </div>
            
                    <!-- Main Content -->
                    <div class="content">
                        <p class="greeting">
                            You've received a new message through your website's contact form. Here are the details:
                        </p>
            
                        <div class="message-box">
                            <h3 class="message-title">Message Details</h3>
                            
                            <div class="message-details">
                                <div class="detail-row">
                                    <span class="detail-label">Name:</span>
                                    <span>${sanitizedData.name}</span>
                                </div>
                                
                                <div class="detail-row">
                                    <span class="detail-label">Email:</span>
                                    <span>${sanitizedData.email}</span>
                                </div>
                                
                                <div class="detail-row">
                                    <span class="detail-label">Phone:</span>
                                    <span>${sanitizedData.phone}</span>
                                </div>
                                
                                <div class="detail-row">
                                    <span class="detail-label">Subject:</span>
                                    <span>${sanitizedData.subject}</span>
                                </div>
                                
                                <div class="detail-row">
                                    <span class="detail-label">Message:</span>
                                    <div style="margin-top: 8px;">${sanitizedData.message}</div>
                                </div>
                                
                                <div class="detail-row">
                                    <span class="detail-label">Additional Info:</span>
                                    <div style="margin-top: 8px;">
                                        <p>${sanitizedData.additionalInfo}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
            
                        <p class="greeting">
                            This message was submitted at <strong>${sanitizedData.submissionTime}</strong> from the IP address <strong>${sanitizedData.ipAddress}</strong>.
                        </p>
            
                        <p class="greeting">
                            This message was submitted through the <strong>${sanitizedData.domain}</strong> - contact form.
                        </p>
                    </div>
            
                    <!-- Footer Section -->
                    <div class="footer">
                        <p class="team-name">ENT Insight Team</p>
                        <p class="footer-text">
                            This is an automated notification. Please respond directly to the sender's email address.
                        </p>
                        <p class="footer-text" style="font-size: 12px; margin-top: 20px;">
                            © 2024 ENT Insight. All rights reserved.
                        </p>
                    </div>
                </div>
            </body>
            </html>`;
}
