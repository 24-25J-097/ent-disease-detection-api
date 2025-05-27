import { check } from "express-validator";
import mongoose from "mongoose";
import { Role } from "../../enums/auth";

export const AuthValidations = {
    email: () => check('email')
        .not()
        .isEmpty()
        .withMessage('Email is required!')
        .isEmail()
        .normalizeEmail({gmail_remove_dots: false})
        .withMessage('Invalid email address!'),
    phone: () => check('phone')
        .isMobilePhone('si-LK')
        .withMessage('Phone number is invalid or outside the LK'),
    password: () => check('password')
        .trim()
        .isString()
        .not()
        .isEmpty()
        .withMessage('Password is required!')
        .isLength({min: 6, max: 40})
        .withMessage('Password must be at least 6 characters long & not more than 40 characters long!')
        .not().isIn(['123', 'password', 'god', 'abc']).withMessage('Do not use a common word as the password')
        .matches(/\d/).withMessage('Password must contain a number!'),
    passwordLogin: () => check('password')
        .trim()
        .isString()
        .not()
        .isEmpty()
        .withMessage('Password is required!'),
    confirmPassword: () => check('confirmPassword')
        .trim()
        .isString()
        .not()
        .isEmpty()
        .withMessage('Confirm password is required!')
        .custom(async (confirmPassword, {req}) => {
            if (req.body.password !== confirmPassword) throw new Error('Passwords must be same!');
        }),
    role: (roles: Role[]) => check('role')
        .isIn(roles)
        .withMessage('Unauthorized user role!'),
    name: () => check('name')
        .isString()
        .not()
        .isEmpty()
        .withMessage('Name is required!')
        .isLength({max: 1000})
        .withMessage('Name field should not be more than 1000 characters long!'),
    dateOfBirth: () => check('dateOfBirth')
        .isString()
        .not()
        .isEmpty()
        .withMessage('Date of birth is required!')
        .isISO8601()
        .withMessage('Date of birth must be a valid date in ISO8601 format (YYYY-MM-DD)!'),
    country: () => check('country')
        .isString()
        .not()
        .isEmpty()
        .withMessage('Country is required!')
        .isLength({max: 100})
        .withMessage('Country field should not be more than 100 characters long!'),
    institution: () => check('institution')
        .isString()
        .not()
        .isEmpty()
        .withMessage('Institution is required!')
        .isLength({max: 200})
        .withMessage('Institution field should not be more than 200 characters long!'),
    studyYear: () => check('studyYear')
        .isString()
        .not()
        .isEmpty()
        .withMessage('Study year is required!')
        .isLength({max: 50})
        .withMessage('Study year field should not be more than 50 characters long!'),
    specialization: () => check('specialization')
        .isString()
        .not()
        .isEmpty()
        .withMessage('Specialization is required!')
        .isLength({max: 100})
        .withMessage('Specialization field should not be more than 100 characters long!'),
    agreeToTerms: () => check('agreeToTerms')
        .isBoolean()
        .custom((value) => {
            if (!value) throw new Error('You must agree to the terms and conditions!');
            return true;
        }),
    agreeToNewsletter: () => check('agreeToNewsletter')
        .isBoolean(),
    studentId: () => check('studentId')
        .isString()
        .isLength({max: 10})
        .withMessage('Student ID field should not be more than 10 characters long!'),
    facultyId: () => check('facultyId')
        .isString()
        .isLength({max: 10})
        .withMessage('Faculty ID field should not be more than 10 characters long!'),
    adminId: () => check('adminId')
        .isString()
        .isLength({max: 10})
        .withMessage('Admin ID field should not be more than 10 characters long!'),
    adminToken: () => check('adminToken')
        .trim()
        .isString()
        .not()
        .isEmpty()
        .withMessage('Required to be authorized token!'),
    nic: () => check('nic')
        .isString()
        .isLength({min: 10, max: 12})
        .withMessage('NIC must be at least 10 characters long & not more than 12 characters long!'),
    text: (key: string) => check(key)
        .isString()
        .isLength({max: 1000}),
    largeText: (key: string) => check(key)
        .isString()
        .isLength({max: 10000}),
    objectId: (key = "_id") => check(key)
        .not()
        .isEmpty()
        .withMessage(`${key} cannot be empty`)
        .custom((v) => mongoose.isValidObjectId(v))
        .withMessage(`${key} is not a valid mongoDb objectID`),
    upload: (key = "upload") => check()
        .not()
        .isEmpty()
        .withMessage(`${key} cannot be empty`)
        .custom((v) => mongoose.isValidObjectId(v))
        .withMessage(`${key} is invalid`),
    uploads: (key = "uploads") => check(`${key}.*._id`)
        .not()
        .isEmpty()
        .withMessage(`${key} objects cannot be empty`)
        .custom((v) => mongoose.isValidObjectId(v))
        .withMessage(`${key} objects are invalid`),
};
