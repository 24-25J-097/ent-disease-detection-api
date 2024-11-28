import { DUser, IUser } from "./User.model";

interface CommonAttributes {
    studentId: string;
    year?: string;
    university?: string;
}

export interface DStudent extends CommonAttributes, DUser {

}

export interface IStudent extends CommonAttributes, IUser {
    readonly studentId: string;
    readonly year: string;
    readonly university: string;
}
