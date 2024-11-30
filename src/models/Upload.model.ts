import * as mongoose from "mongoose";
import {StringOrObjectId} from "../types/util-types";

export interface DUpload {
    ownerId?: StringOrObjectId;
    type: string;
    path: string;
    originalName?: string;
    name?: string;
    extension?: string;
    isUrl?: boolean;
    notes?: string;
    fileSize?: number;
}

export interface IUpload extends DUpload, mongoose.Document {
    url: string;
    path: string;
}
