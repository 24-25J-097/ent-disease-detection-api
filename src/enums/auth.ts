export enum Role {
    ADMIN = "admin",
    DOCTOR = "doctor",
    RADIOLOGIST = "radiologist",
    STUDENT = "student",
}

export namespace Role {
    export function getPermissions(role: Role): Permission[] {
        switch (role) {
            case Role.ADMIN:
                // return Object.values(Permission);
                return [];
            case Role.DOCTOR:
                return [];
            case Role.RADIOLOGIST:
                return [];
            case Role.STUDENT:
                return [];
            default:
                return [];
        }
    }

    export function getTitle(role: string | Role): string {
        switch (role) {
            case Role.ADMIN:
                return "Admin";
            case Role.DOCTOR:
                return "Doctor";
            case Role.RADIOLOGIST:
                return "Radiologist";
            case Role.STUDENT:
                return "Student";
            default:
                return "Invalid-Role";
        }
    }
}

export enum Permission {

}

export enum SignedUpAs {
    EMAIL = "EMAIL",
    GOOGLE = "GOOGLE",
    FACEBOOK = "FACEBOOK",
}
