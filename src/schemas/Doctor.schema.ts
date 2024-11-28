import * as mongoose from "mongoose";
import {Schema} from "mongoose";
import User, { UserSchemaOptions } from "./User.schema";
import {IDoctor} from "../models/Doctor.model";

export const DoctorSchema = new mongoose.Schema({
    doctorId: {
        type:  Schema.Types.String,
        required: true
    },
    nic: {
        type:  Schema.Types.String,
        required: true
    },
    actions: {
        type: [{
            action: { type: Schema.Types.String, required: true },
            actionAt: { type: Schema.Types.Date, required: true },
        }],
        required: false,
        default: [],
    }
}, UserSchemaOptions);

export const Doctor = User.discriminator<IDoctor>('doctors', DoctorSchema, "doctor");

export default Doctor;
