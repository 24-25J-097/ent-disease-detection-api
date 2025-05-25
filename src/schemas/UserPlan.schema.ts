import * as mongoose from "mongoose";
import {IUserPlan} from "../models/UserPlan.model";

export const UserPlanSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    package: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Package',
        required: true
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    endDate: {
        type: Date,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    purchaseDate: {
        type: Date,
        default: Date.now
    },
    transactionId: {
        type: String,
        trim: true
    },
    paymentMethod: {
        type: String,
        trim: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'completed'
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

// Index for efficient queries
UserPlanSchema.index({user: 1, isActive: 1});
UserPlanSchema.index({endDate: 1});

export const UserPlan = mongoose.model<IUserPlan>("UserPlan", UserPlanSchema);