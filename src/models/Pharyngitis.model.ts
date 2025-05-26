import mongoose from "mongoose";
import {StringOrObjectId} from "../types/util-types";

interface CommonAttributes {
    diagnosticianId?: StringOrObjectId;
    patientId: StringOrObjectId;
    additionalInformation?: string;
    isLearningPurpose: boolean;
    throatImage: mongoose.Schema.Types.ObjectId;
    diagnosisResult?: {
        isPharyngitis?: boolean;
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

export interface DPharyngitis extends CommonAttributes {
    _id?: StringOrObjectId;
}

export interface IPharyngitis extends CommonAttributes, mongoose.Document {
    _id: StringOrObjectId;
}
