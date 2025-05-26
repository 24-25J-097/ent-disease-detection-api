import { DUser, IUser } from "./User.model";

interface CommonAttributes {
    studentId?: string;
    dateOfBirth?: string;
    country?: string;
    institution?: string;
    studyYear?: string;
    specialization?: string;
    agreeToTerms?: boolean;
    agreeToNewsletter?: boolean;
}

export interface DStudent extends CommonAttributes, DUser {

}

export interface IStudent extends CommonAttributes, IUser {
    readonly studentId: string;
    readonly dateOfBirth: string;
    readonly country: string;
    readonly institution: string;
    readonly studyYear: string;
    readonly specialization: string;
    readonly agreeToTerms: boolean;
    readonly agreeToNewsletter: boolean;
}
