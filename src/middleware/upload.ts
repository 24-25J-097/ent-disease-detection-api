import multer from "multer";
import fs from "fs";
import path from "path";
import {AppLogger} from "../utils/logging";

const uploadDir = path.join(__dirname, "../uploads"); // Adjust the path as needed

// Ensure the upload directory exists with error logging
try {
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, {recursive: true});
    }
} catch (error: unknown) {
    AppLogger.error(`Failed to create upload directory.`);
    throw error;
}

// Configure multer for memory storage
// const storage = multer.memoryStorage();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        try {
            cb(null, uploadDir); // Set the upload directory
        } catch (error: unknown) {
            AppLogger.error(`Error in setting upload destination.`);
            throw error;
        }
    },
    filename: (req, file, cb) => {
        try {
            // Generate a unique name using the desired format
            const timestamp = new Date().getTime(); // Get timestamp in milliseconds
            const date = new Date().toISOString().slice(0, 10).replace(/-/g, ""); // Remove hyphens
            const customName = `cholesteatoma_ei_${date}${timestamp}`;

            const extension = file.originalname.split('.').pop(); // Extract file extension
            cb(null, `${customName}.${extension}`); // Combine custom name and extension
        } catch (error: unknown) {
            AppLogger.error(`Error in generating filename.`);
            throw error;
        }
    },
});

export const upload = multer({storage});
