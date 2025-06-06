import mongoose from "mongoose";
import {StringOrObjectId} from "../types/util-types";

interface CommonAttributes {
    diagnosticianId?: StringOrObjectId;
    patientId: StringOrObjectId;
    additionalInformation?: string;
    endoscopyImage: mongoose.Schema.Types.ObjectId;
    isLearningPurpose: boolean;
    diagnosisResult?: {
        isCholesteatoma?: boolean;
        stage?: string;
        suggestions?: string;
        confidenceScore?: number;
        prediction?: "valid" | "invalid" | "N/A";
    };
    status?: "pending" | "diagnosed" | "failed";
    accepted?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface DCholesteatoma extends CommonAttributes {
    _id?: StringOrObjectId;
}

export interface ICholesteatoma extends CommonAttributes, mongoose.Document {
    _id: StringOrObjectId;
}
