import * as mongoose from "mongoose";
import { Schema } from "mongoose";
import { IPatient } from "../models/Patient.model";
import { Role } from "../enums/auth";
import User, { UserSchemaOptions } from "./User.schema";

export const PatientSchema = new mongoose.Schema({
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

const Patient = User.discriminator<IPatient>(Role.PATIENT, PatientSchema);

export default Patient;