import * as mongoose from "mongoose";
import { Schema } from "mongoose";
import { IPatient } from "../models/Patient.model";
import { Role } from "../enums/auth";
import User, { UserSchemaOptions } from "./User.schema";
import { Counter } from "./Counter.schema";

export const PatientSchema = new mongoose.Schema({
    patientId: {
        type: Schema.Types.String,
        required: false,
        unique: true,
    },
    firstName: {
        type: Schema.Types.String,
        required: true,
    },
    lastName: {
        type: Schema.Types.String,
        required: true,
    },
    dateOfBirth: {
        type: Schema.Types.String,
        required: true,
    },
    gender: {
        type: Schema.Types.String,
        required: true,
    },
    address: {
        type: Schema.Types.String,
        required: false,
    },
    medicalHistory: {
        type: Schema.Types.String,
        required: false,
    },
}, UserSchemaOptions);

// Auto-generate patientId before saving
PatientSchema.pre('save', async function (next) {
    const doc = this as any;

    if (doc.isNew) {
        const counter = await Counter.findOneAndUpdate(
            {id: 'patientId'},
            {$inc: {seq: 1}},
            {new: true, upsert: true}
        );

        const paddedSeq = String(counter.seq).padStart(4, '0'); // e.g., 0001
        doc.patientId = `PT${paddedSeq}`;
    }
    console.log("Generated patientId: ", doc.patientId, doc.isNew);
    next();
});

export const Patient = User.discriminator<IPatient>('patients', PatientSchema, Role.PATIENT);

export default Patient;
