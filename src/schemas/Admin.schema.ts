import * as mongoose from "mongoose";
import {Schema} from "mongoose";
import {IAdmin} from "../models/Admin.model";
import User, {UserSchemaOptions} from "./User.schema";
import {generateRandomString} from "../utils/utils";
import {Counter} from "./Counter.schema";

export const AdminSchema = new mongoose.Schema({
    adminId: {
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

// Auto-generate adminId before saving
AdminSchema.pre('save', async function (next) {
    const doc = this as any;

    if (doc.isNew) {
        const counter = await Counter.findOneAndUpdate(
            {id: 'adminId'},
            {$inc: {seq: 1}},
            {new: true, upsert: true}
        );

        const paddedSeq = String(counter.seq).padStart(4, '0'); // e.g., 0001
        doc.adminId = `AD${paddedSeq}`;
    }

    next();
});

export const Admin = User.discriminator<IAdmin>('admins', AdminSchema, "admin");

export default Admin;
