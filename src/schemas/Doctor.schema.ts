import * as mongoose from "mongoose";
import {Schema} from "mongoose";
import User, {UserSchemaOptions} from "./User.schema";
import {IDoctor} from "../models/Doctor.model";
import {generateRandomString} from "../utils/utils";
import {Counter} from "./Counter.schema";

export const DoctorSchema = new mongoose.Schema({
    doctorId: {
        type: Schema.Types.String,
        required: false,
        unique: true,
    },
    nic: {
        type: Schema.Types.String,
        required: false, // TODO: true
        default: () => generateRandomString(12),
    },
    actions: {
        type: [{
            action: {type: Schema.Types.String, required: true},
            actionAt: {type: Schema.Types.Date, required: true},
        }],
        required: false,
        default: [],
    }
}, UserSchemaOptions);

// Auto-generate doctorId before saving
DoctorSchema.pre('save', async function (next) {
    const doc = this as any;

    if (doc.isNew) {
        const counter = await Counter.findOneAndUpdate(
            {id: 'doctorId'},
            {$inc: {seq: 1}},
            {new: true, upsert: true}
        );

        const paddedSeq = String(counter.seq).padStart(4, '0'); // e.g., 0001
        doc.doctorId = `DR${paddedSeq}`;
    }

    next();
});

export const Doctor = User.discriminator<IDoctor>('doctors', DoctorSchema, "doctor");

export default Doctor;
