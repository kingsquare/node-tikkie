// @flow

type ErrorInput = {
    code: string,
    message: string,
    category: string,
    reference: string,
    status: string,
    traceId: string
};

export class TikkieError extends Error {
    name: string
    message: string
    data: ErrorInput

    constructor(error: ErrorInput) {
        super();
        this.name = 'TikkieError';
        this.message = `${error.code} - ${error.category}: ${error.message}`;
        this.data = error;
    }
};

export class TikkieErrorCollection extends Error {
    name: string
    message: string
    errors: Array<TikkieError>

    constructor(errors: Array<Object>) {
        super();
        this.name = 'TikkieErrorCollection';
        this.errors = errors.map((error: Object) => new TikkieError(error));
        this.message = `[${this.errors.map((error: TikkieError) => error.message).join(', ')}]`;
    }
};
