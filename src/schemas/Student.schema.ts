import * as mongoose from "mongoose";
import {Schema} from "mongoose";
import { IStudent } from "../models/Student.model";
import User, { UserSchemaOptions } from "./User.schema";
import {generateRandomString} from "../utils/utils";

export const StudentSchema = new mongoose.Schema({
    studentId: {
        type:  Schema.Types.String,
        required: false, // TODO: true
        default: () => generateRandomString(10),
    },
    year: {
        type:  Schema.Types.String,
        required: false
    },
    university: {
        type:  Schema.Types.String,
        required: false
    },
}, UserSchemaOptions);
export const Student = User.discriminator<IStudent>('students', StudentSchema, "student");

export default Student;
