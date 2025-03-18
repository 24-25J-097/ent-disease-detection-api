import * as mongoose from "mongoose";
import {Schema} from "mongoose";
import {ISinusitis} from "../models/Sinusitis.model";

const schemaOptions: mongoose.SchemaOptions = {
    _id: true,
    id: false,
    timestamps: true,
    skipVersioning: {
        updatedAt: true
    },
    strict: true,
    toJSON: {
        getters: true,
        virtuals: true,
    },
};

export const SinusitisSchema = new mongoose.Schema({
    diagnosticianId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    patientId: {
        type:  Schema.Types.String,
        required: true
    },
    additionalInformation: {
        type:  Schema.Types.String,
        required: false
    },
    watersViewXrayImage: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Upload'
    },
    diagnosisResult: {
        isSinusitis: {
            type: Schema.Types.Boolean,
            required: false
        },
        severity: {
            type: Schema.Types.String,
            required: false
        },
        suggestions: {
            type: Schema.Types.String,
            required: false
        },
        confidenceScore: {
            type: Schema.Types.Number,
            required: false
        },
        prediction: {
            type: Schema.Types.String,
            enum: ['valid', 'invalid', 'N/A'],
            required: false
        },
    },
    status: {
        type: Schema.Types.String,
        enum: ['pending', 'diagnosed', 'failed'],
        default: 'pending'
    },
    accepted: {
        type:  Schema.Types.Boolean,
        required: false
    },
}, schemaOptions);

const Sinusitis = mongoose.model<ISinusitis>("sinusitis", SinusitisSchema);

export default Sinusitis;
