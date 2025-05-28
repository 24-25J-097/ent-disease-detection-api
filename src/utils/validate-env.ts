import {cleanEnv} from "envalid";
import {port, str, email, url, bool, num} from "envalid/dist/validators";

export default cleanEnv(process.env, {
    PORT: port(),
    API: url(),
    API_URL: url(),
    CLIENT_URL: url(),
    FAST_SERVER_URL: url(),
    TIMEZONE: str(),
    MONGOOSE_URI: str(),
    TEST_MONGOOSE_URI: str(),
    JWT_SECRET: str(),
    FILE_ACCESS_URL: str(),
    DEFAULT_FILE: str(),
    UPLOAD_PATH: str(),
    ADMIN_TOKEN: str(),

    // Email Settings
    EMAIL_SERVICE: str({choices: ['custom', 'gmail']}),

    // Gmail
    APP_GMAIL: email(),
    APP_GMAIL_PSWD: str(),

    // Custom Domain
    APP_EMAIL_HOST: str(),
    APP_EMAIL_PORT: port(),
    APP_EMAIL_SECURE: bool(),
    APP_EMAIL_USER: email(),
    APP_EMAIL_PASSWORD: str(),
    APP_EMAIL_FROM: email(),
    APP_CONTACT_RECEIVER_EMAIL: email(),

    // Branding
    EMAIL_BRAND_NAME: str(),
    EMAIL_BRAND_COLOR: str(),
    EMAIL_LOGIN_URL: url(),
    EMAIL_UNSUBSCRIBE_URL: url(),

    // Performance
    EMAIL_MAX_CONNECTIONS: num(),
    EMAIL_MAX_RETRIES: num(),
    EMAIL_RATE_LIMIT: num(),
    EMAIL_MAX_MESSAGES: num(),
    EMAIL_RETRY_DELAY: num(),
    EMAIL_CONNECTION_TIMEOUT: num(),
    EMAIL_GREETING_TIMEOUT: num(),
    EMAIL_SOCKET_TIMEOUT: num(),
    EMAIL_POOL_ENABLED: bool(),
});
