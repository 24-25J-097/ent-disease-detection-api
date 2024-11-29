export class ApplicationError extends Error {
    statusCode: number;

    constructor(msg: string, statusCode = 500) {
        super(msg);
        this.statusCode = statusCode;
        Object.setPrototypeOf(this, ApplicationError.prototype);
    }
}
