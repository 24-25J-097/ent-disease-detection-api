import * as mongoose from "mongoose";
import {Role} from "../enums/auth";
import {IRoleAccessPolicy} from "../models/RoleAccessPolicy.model";

export const schemaOptions: mongoose.SchemaOptions = {
    _id: true,
    id: false,
    timestamps: true,
    skipVersioning: {
        updatedAt: true
    },
    strict: false,
    toJSON: {
        getters: true,
        virtuals: true,
    },
};

export const RoleAccessPolicySchema = new mongoose.Schema({
    role: {
        type: String,
        enum: Object.values(Role),
        required: true,
        unique: true
    },
    hasUnlimitedAccess: {
        type: Boolean,
        default: false
    },
    requiresPackage: {
        type: Boolean,
        default: true
    },
    description: {
        type: String,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, schemaOptions);

export const RoleAccessPolicy = mongoose.model<IRoleAccessPolicy>("RoleAccessPolicy", RoleAccessPolicySchema);
