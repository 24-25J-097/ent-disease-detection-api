import env from "../utils/validate-env";

export function getFromAddress(): string {
    const service = (env.EMAIL_SERVICE || 'gmail').toLowerCase();

    switch (service) {
        case 'gmail':
            return env.APP_GMAIL || env.APP_EMAIL_USER;
        case 'custom':
            return env.APP_EMAIL_FROM || env.APP_EMAIL_USER;
        default:
            return env.APP_EMAIL_FROM;
    }
}

export function getDomainFromEmail(email: string): string {
    return email.split('@')[1] || 'entinsight.com';
}

export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export function sanitizeHtml(input: string): string {
    return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function extractTextFromHtml(html: string): string {
    return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

export function generateMessageId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    const domain = getDomainFromEmail(getFromAddress());
    return `${timestamp}.${random}@${domain}`;
}

export function shouldRetry(error: any): boolean {
    // Retry on transient network errors
    const retryableErrors = [
        'ECONNRESET',
        'ENOTFOUND',
        'ECONNREFUSED',
        'ETIMEDOUT',
        'ESOCKET'
    ];

    return retryableErrors.some(err =>
        error.code === err ||
        error.message?.includes(err) ||
        error.response?.includes('4') // 4xx temporary failures
    );
}
