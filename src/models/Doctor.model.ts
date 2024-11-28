import { DUser, IUser } from "./User.model";

interface CommonAttributes {
    doctorId: string;
    nic: string;
}

export interface DDoctor extends CommonAttributes, DUser {
    actions?: [
        {
            action: string,
            actionAt: Date,
        }
    ],
}

export interface IDoctor extends CommonAttributes, IUser {
   readonly doctorId: string;
   readonly nic: string;
}
