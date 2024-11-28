import * as mongoose from "mongoose";
import {Schema} from "mongoose";
import { IAdmin } from "../models/Admin.model";
import User, { UserSchemaOptions } from "./User.schema";
import {generateRandomString} from "../utils/utils";

export const AdminSchema = new mongoose.Schema({
    adminId: {
        type:  Schema.Types.String,
        required: false, // TODO: true
        default: () => generateRandomString(10),
    },
    nic: {
        type:  Schema.Types.String,
        required: false, // TODO: true
        default: () => generateRandomString(12),
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

export const Admin = User.discriminator<IAdmin>('admins', AdminSchema, "admin");

export default Admin;
