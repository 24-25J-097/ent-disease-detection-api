import { DUser, IUser } from "./User.model";

interface CommonAttributes {
    radiologistId?: string;
    nic?: string;
}

export interface DRadiologist extends CommonAttributes, DUser {
    actions?: [
        {
            action: string,
            actionAt: Date,
        }
    ],
}

export interface IRadiologist extends CommonAttributes, IUser {
   readonly radiologistId: string;
   readonly nic: string;
}
