import * as mongoose from "mongoose";
import {Schema} from "mongoose";
import User, { UserSchemaOptions } from "./User.schema";
import {IRadiologist} from "../models/Radiologist.model";

export const RadiologistSchema = new mongoose.Schema({
    radiologistId: {
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

export const Radiologist = User.discriminator<IRadiologist>('radiologists', RadiologistSchema, "radiologist");

export default Radiologist;
