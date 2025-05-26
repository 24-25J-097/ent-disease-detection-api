import * as mongoose from "mongoose";
import {Schema} from "mongoose";
import {IStudent} from "../models/Student.model";
import User, {UserSchemaOptions} from "./User.schema";
import {Counter} from "./Counter.schema";

export const StudentSchema = new mongoose.Schema({
    studentId: {
        type: Schema.Types.String,
        required: false,
        unique: true,
    },
    dateOfBirth: {
        type: Schema.Types.String,
        required: true
    },
    country: {
        type: Schema.Types.String,
        required: true
    },
    institution: {
        type: Schema.Types.String,
        required: true
    },
    studyYear: {
        type: Schema.Types.String,
        required: true
    },
    specialization: {
        type: Schema.Types.String,
        required: true
    },
    agreeToTerms: {
        type: Schema.Types.Boolean,
        required: true
    },
    agreeToNewsletter: {
        type: Schema.Types.Boolean,
        required: true
    },
}, UserSchemaOptions);

// Auto-generate studentId before saving
StudentSchema.pre('save', async function (next) {
    const doc = this as any;

    if (doc.isNew) {
        const counter = await Counter.findOneAndUpdate(
            {id: 'studentId'},
            {$inc: {seq: 1}},
            {new: true, upsert: true}
        );

        const paddedSeq = String(counter.seq).padStart(4, '0'); // e.g., 0001
        doc.studentId = `ST${paddedSeq}`;
    }

    next();
});

export const Student = User.discriminator<IStudent>('students', StudentSchema, "student");

export default Student;
