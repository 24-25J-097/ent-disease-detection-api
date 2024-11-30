import * as mongoose from "mongoose";
import {Schema} from "mongoose";
import {ICholesteatoma} from "../models/Cholesteatoma.model";

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

export const CholesteatomaSchema = new mongoose.Schema({
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
    endoscopyImage: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Upload'
    },
    diagnosisResult: {
        isCholesteatoma: {
            type: Schema.Types.Boolean,
            required: false
        },
        stage: {
            type: Schema.Types.String,
            required: false
        },
        suggestions: {
            type: Schema.Types.String,
            required: false
        }
    },
    status: {
        type: Schema.Types.String,
        enum: ['pending', 'diagnosed', 'failed'],
        default: 'pending'
    },
}, schemaOptions);

const Cholesteatoma = mongoose.model<ICholesteatoma>("cholesteatoma", CholesteatomaSchema);

export default Cholesteatoma;
