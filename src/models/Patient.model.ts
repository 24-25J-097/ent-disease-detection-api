import { DUser, IUser } from "./User.model";

interface CommonAttributes {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    address?: string;
    medicalHistory?: string;
}

export interface DPatient extends CommonAttributes, DUser {

}

export interface IPatient extends CommonAttributes, IUser {
    readonly firstName: string;
    readonly lastName: string;
    readonly dateOfBirth: string;
    readonly gender: string;
    readonly address?: string;
    readonly medicalHistory?: string;
}