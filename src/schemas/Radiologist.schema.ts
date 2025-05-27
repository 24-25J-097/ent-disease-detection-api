import * as mongoose from "mongoose";
import {Schema} from "mongoose";
import User, {UserSchemaOptions} from "./User.schema";
import {IRadiologist} from "../models/Radiologist.model";
import {generateRandomString} from "../utils/utils";
import {Counter} from "./Counter.schema";

export const RadiologistSchema = new mongoose.Schema({
    radiologistId: {
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

// Auto-generate radiologistId before saving
RadiologistSchema.pre('save', async function (next) {
    const doc = this as any;

    if (doc.isNew) {
        const counter = await Counter.findOneAndUpdate(
            {id: 'radiologistId'},
            {$inc: {seq: 1}},
            {new: true, upsert: true}
        );

        const paddedSeq = String(counter.seq).padStart(4, '0'); // e.g., 0001
        doc.radiologistId = `RD${paddedSeq}`;
    }

    next();
});

export const Radiologist = User.discriminator<IRadiologist>('radiologists', RadiologistSchema, "radiologist");

export default Radiologist;
