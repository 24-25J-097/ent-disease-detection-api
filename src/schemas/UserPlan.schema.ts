import * as mongoose from "mongoose";
import {IUserPlan} from "../models/UserPlan.model";

const UserPlanSchemaOptions: mongoose.SchemaOptions = {
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
    toObject: { virtuals: true }
};

export const UserPlanSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    package_id: {
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
}, UserPlanSchemaOptions);

// Index for efficient queries
UserPlanSchema.index({user_id: 1, isActive: 1});
UserPlanSchema.index({endDate: 1});

UserPlanSchema.virtual('user', {
    ref: 'users', // the collection/model name
    localField: 'user_id',
    foreignField: '_id',
    justOne: true, // default is false
    // match: {archived: false}
});

UserPlanSchema.virtual('package', {
    ref: 'Package', // the collection/model name
    localField: 'package_id',
    foreignField: '_id',
    justOne: true, // default is false
    // match: {archived: false}
});

export const UserPlan = mongoose.model<IUserPlan>("UserPlan", UserPlanSchema);
