import * as mongoose from "mongoose";
import {IPackage} from "../models/Package.model";

export const PackageSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    dailyRequestLimit: {
        type: Number,
        required: true,
        min: 0
    },
    durationInDays: {
        type: Number,
        required: true,
        min: 1
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    isUnlimited: {
        type: Boolean,
        default: false
    },
    description: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

export const Package = mongoose.model<IPackage>("Package", PackageSchema);