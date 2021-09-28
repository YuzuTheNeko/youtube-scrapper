export class SearchError extends Error {
    constructor(error: string) {
        super(error);

        Error.captureStackTrace(this, SearchError);
    }
}
