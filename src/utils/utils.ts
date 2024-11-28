import { Types } from "mongoose";

export function isObjectId(v: string): boolean {
    return Types.ObjectId.isValid(v) && new Types.ObjectId(v).toHexString() === v;
}

export const generateRandomString = (length: number): string => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
};
