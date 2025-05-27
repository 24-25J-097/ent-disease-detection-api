import mongoose from "mongoose";
import {StringOrObjectId} from "../types/util-types";

interface CommonAttributes {
    diagnosticianId?: StringOrObjectId;
    patientId: StringOrObjectId;
    additionalInformation?: string;
    isLearningPurpose: boolean;
    watersViewXrayImage: mongoose.Schema.Types.ObjectId;
    diagnosisResult?: {
        isSinusitis?: boolean;
        severity?: string;
        suggestions?: string;
        confidenceScore?: number;
        prediction?: "valid" | "invalid" | "N/A";
    };
    status?: "pending" | "diagnosed" | "failed";
    accepted?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface DSinusitis extends CommonAttributes {
    _id?: StringOrObjectId;
}

export interface ISinusitis extends CommonAttributes, mongoose.Document {
    _id: StringOrObjectId;
}
