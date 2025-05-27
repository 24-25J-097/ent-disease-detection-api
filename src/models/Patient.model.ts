import {DUser, IUser} from "./User.model";

interface CommonAttributes {
    patientId?: string;
    name: string;
    nic: string;
    dateOfBirth: string;
    gender: string;
    address?: string;
    medicalHistory?: string;
}

export interface DPatient extends CommonAttributes, DUser {

}

export interface IPatient extends CommonAttributes, IUser {
    readonly patientId: string;
    readonly name: string;
    readonly nic: string;
    readonly dateOfBirth: string;
    readonly gender: string;
    readonly address?: string;
    readonly medicalHistory?: string;
}
