import * as mongoose from "mongoose";
import {IRequestLog} from "../models/RequestLog.model";

export const RequestLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    endpoint: {
        type: String,
        required: true,
        trim: true
    },
    method: {
        type: String,
        required: true,
        enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        trim: true
    },
    statusCode: {
        type: Number
    },
    responseTime: {
        type: Number // in milliseconds
    },
    userAgent: {
        type: String,
        trim: true
    },
    ip: {
        type: String,
        trim: true
    },
    timestamp: {
        type: Date,
        default: Date.now,
        required: true
    }
}, {
    timestamps: true
});

// Index for efficient queries
RequestLogSchema.index({user: 1, timestamp: -1});
RequestLogSchema.index({timestamp: -1});
RequestLogSchema.index({endpoint: 1, timestamp: -1});

export const RequestLog = mongoose.model<IRequestLog>("RequestLog", RequestLogSchema);
