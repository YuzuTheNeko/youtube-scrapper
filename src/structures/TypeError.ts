export class TypeError extends Error {
    constructor(error: string) {
        super(error);

        Error.captureStackTrace(this, TypeError);
    }
}
