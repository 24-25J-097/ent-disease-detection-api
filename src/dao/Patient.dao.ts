import { AppLogger } from "../utils/logging";
import { DPatient, IPatient } from "../models/Patient.model";
import { ApplicationError } from "../utils/application-error";
import Patient from "../schemas/Patient.schema";
import { Role } from "../enums/auth";
import { IUser } from "../models/User.model";

export async function createPatient(data: Partial<DPatient>): Promise<IPatient> {
    try {
        const patientData: DPatient = {
            firstName: data.firstName!,
            lastName: data.lastName!,
            name: `${data.firstName} ${data.lastName}`,
            email: data.email!,
            password: data.password!,
            phone: data.phone,
            dateOfBirth: data.dateOfBirth!,
            gender: data.gender!,
            address: data.address,
            medicalHistory: data.medicalHistory,
            role: Role.PATIENT,
            isActive: true,
            isVerified: true,
        };
        
        const iPatient = new Patient(patientData);
        const savedPatient = await iPatient.save();
        AppLogger.info(`Create Patient (ID: ${savedPatient._id})`);
        return savedPatient;
    } catch (error: unknown) {
        if (error instanceof Error) {
            AppLogger.error(`Creating patient: ${error.message}`);
            throw new ApplicationError(`Creating patient: ${error.message}`);
        }
        throw error;
    }
}

export async function updatePatient(patientId: string, data: Partial<DPatient>): Promise<IPatient> {
    try {
        // If name is being updated, update it based on firstName and lastName
        if (data.firstName || data.lastName) {
            const patient = await Patient.findById(patientId);
            if (!patient) {
                AppLogger.error(`Patient (ID: ${patientId}): Not Found`);
                throw new ApplicationError(`Update patient: Patient not found for ID: ${patientId}!`, 404);
            }
            
            const firstName = data.firstName || patient.firstName;
            const lastName = data.lastName || patient.lastName;
            data.name = `${firstName} ${lastName}`;
        }
        
        const updatedPatient = await Patient.findByIdAndUpdate(patientId, data, { new: true });
        if (updatedPatient) {
            AppLogger.info(`Update Patient (ID: ${updatedPatient._id})`);
            return updatedPatient;
        } else {
            AppLogger.error(`Patient (ID: ${patientId}): Not Found`);
            throw new ApplicationError(`Update patient: Patient not found for ID: ${patientId}!`, 404);
        }
    } catch (error: unknown) {
        if (error instanceof Error) {
            AppLogger.error(`Updating patient: ${error.message}`);
            throw new ApplicationError(`Updating patient: ${error.message}`);
        }
        throw error;
    }
}

export async function getPatient(patientId: string): Promise<IPatient> {
    try {
        const patient = await Patient.findById(patientId);
        if (patient) {
            AppLogger.info(`Get Patient (ID: ${patient._id})`);
            return patient;
        } else {
            AppLogger.error(`Patient (ID: ${patientId}): Not Found`);
            throw new ApplicationError(`Get patient: Patient not found for ID: ${patientId}!`, 404);
        }
    } catch (error: unknown) {
        if (error instanceof Error) {
            AppLogger.error(`Getting patient: ${error.message}`);
            throw new ApplicationError(`Getting patient: ${error.message}`);
        }
        throw error;
    }
}

export async function getAllPatients(ownUser: IUser): Promise<IPatient[]> {
    try {
        const patients = await Patient.find();
        AppLogger.info(`Get all patients (count: ${patients.length}) by ${Role.getTitle(ownUser.role)} (ID: ${ownUser._id})`);
        return patients;
    } catch (error: unknown) {
        if (error instanceof Error) {
            AppLogger.error(`Getting all patients: ${error.message}`);
            throw new ApplicationError(`Getting all patients: ${error.message}`);
        }
        throw error;
    }
}

export async function deletePatient(patientId: string): Promise<IPatient> {
    try {
        const deletedPatient = await Patient.findOneAndDelete({_id: patientId, role: Role.PATIENT});
        if (deletedPatient.value) {
            AppLogger.info(`Delete Patient (ID: ${deletedPatient.value._id})`);
            return deletedPatient.value;
        } else {
            AppLogger.error(`Patient (ID: ${patientId}): Not Found`);
            throw new ApplicationError(`Delete patient: Patient not found for ID: ${patientId}!`, 404);
        }
    } catch (error: unknown) {
        if (error instanceof Error) {
            AppLogger.error(`Deleting patient: ${error.message}`);
            throw new ApplicationError(`Deleting patient: ${error.message}`);
        }
        throw error;
    }
}