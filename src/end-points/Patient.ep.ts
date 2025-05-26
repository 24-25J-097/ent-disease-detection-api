import {Request, Response} from "express";
import * as PatientDao from "../dao/Patient.dao";
import {AppLogger} from "../utils/logging";
import {ApplicationError} from "../utils/application-error";
import {IUser} from "../models/User.model";
import {DPatient} from "../models/Patient.model";
import Joi from "joi";

// Validation schema for creating a patient
const createPatientSchema = Joi.object({
    name: Joi.string().required(),
    nic: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    phone: Joi.string().optional(),
    dateOfBirth: Joi.string().required(),
    gender: Joi.string().valid('male', 'female', 'other').required(),
    address: Joi.optional().empty(),
    medicalHistory: Joi.string().optional(),
});

// Validation schema for updating a patient
const updatePatientSchema = Joi.object({
    name: Joi.string().optional(),
    nic: Joi.string().optional(),
    email: Joi.string().email().optional(),
    phone: Joi.string().optional(),
    dateOfBirth: Joi.string().optional(),
    gender: Joi.string().valid('male', 'female', 'other').optional(),
    address: Joi.string().optional().empty(),
    medicalHistory: Joi.string().optional(),
});

export async function createPatient(req: Request, res: Response) {
    try {
        // Validate request body
        const requestBody = {
            name: req.body.name,
            nic: req.body.nic,
            email: req.body.email,
            password: req.body.password || '123456@aA',
            phone: req.body.phone,
            dateOfBirth: req.body.dateOfBirth,
            gender: req.body.gender,
            address: req.body.address,
            medicalHistory: req.body.medicalHistory
        };

        const {error, value} = createPatientSchema.validate(requestBody);

        if (error) {
            return res.sendError(error.details[0].message, 422);
        }

        const patientData: Partial<DPatient> = value;
        const patient = await PatientDao.createPatient(patientData);

        return res.sendSuccess(patient, "Patient created successfully");
    } catch (error) {
        if (error instanceof ApplicationError) {
            return res.sendError(error.message);
        }
        AppLogger.error(`Create patient error: ${error}`);
        return res.sendError("Internal server error");
    }
}

export async function updatePatient(req: Request, res: Response) {
    try {
        const patientId = req.params.id;
        const requestBody = {
            name: req.body.name,
            nic: req.body.nic,
            email: req.body.email,
            phone: req.body.phone,
            dateOfBirth: req.body.dateOfBirth,
            gender: req.body.gender,
            address: req.body.address,
            medicalHistory: req.body.medicalHistory
        };
        // Validate request body
        const {error, value} = updatePatientSchema.validate(requestBody);
        if (error) {
            return res.sendError(error.details[0].message, 422);
        }

        const patientData: Partial<DPatient> = value;
        const patient = await PatientDao.updatePatient(patientId, patientData);

        return res.sendSuccess(patient, "Patient updated successfully");
    } catch (error) {
        if (error instanceof ApplicationError) {
            return res.sendError(error.message, error.statusCode);
        }
        AppLogger.error(`Update patient error: ${error}`);
        return res.sendError("Internal server error");
    }
}

export async function getPatient(req: Request, res: Response) {
    try {
        const patientId = req.params.id;
        const patient = await PatientDao.getPatient(patientId);

        return res.sendSuccess(patient, "Patient retrieved successfully");
    } catch (error) {
        if (error instanceof ApplicationError) {
            return res.status(error.statusCode).json({error: error.message});
        }
        AppLogger.error(`Get patient error: ${error}`);
        return res.status(500).json({error: "Internal server error"});
    }
}

export async function getAllPatients(req: Request, res: Response) {
    try {
        const ownUser = req.user as IUser;
        const patients = await PatientDao.getAllPatients(ownUser);

        return res.sendSuccess(patients, "Patients retrieved successfully");
    } catch (error) {
        if (error instanceof ApplicationError) {
            return res.status(error.statusCode).json({error: error.message});
        }
        AppLogger.error(`Get all patients error: ${error}`);
        return res.status(500).json({error: "Internal server error"});
    }
}

export async function deletePatient(req: Request, res: Response) {
    try {
        const patientId = req.params.id;
        const patient = await PatientDao.deletePatient(patientId);

        return res.sendSuccess(patient, "Patient deleted successfully");
    } catch (error) {
        if (error instanceof ApplicationError) {
            return res.sendError(error.message, error.statusCode);
        }
        AppLogger.error(`Delete patient error: ${error}`);
        return res.sendError("Internal server error");
    }
}

// Validation schema for filtering patients
const filterPatientsSchema = Joi.object({
    filter: Joi.object({
        name: Joi.string().optional(),
        email: Joi.string().optional(),
        phone: Joi.string().optional(),
        search: Joi.string().optional()
    }).optional()
});

export async function filterPatients(req: Request, res: Response) {
    try {
        const ownUser = req.user as IUser;

        // Validate query parameters
        const { error, value } = filterPatientsSchema.validate(req.query);
        if (error) {
            return res.sendError(error.details[0].message, 422);
        }

        const filterOptions: PatientDao.PatientFilterOptions = {
            name: value.name,
            email: value.email,
            phone: value.phone,
            search: value.search,
        };

        const filteredPatients = await PatientDao.filterPatients(ownUser, filterOptions);

        return res.sendSuccess(filteredPatients, "Patients filtered successfully");
    } catch (error) {
        if (error instanceof ApplicationError) {
            return res.sendError(error.message, error.statusCode);
        }
        AppLogger.error(`Filter patients error: ${error}`);
        return res.sendError("Internal server error");
    }
}
