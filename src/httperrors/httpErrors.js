// Note. These error classes are copied from Luka Vidaković's article 
// found here: https://dev.to/apisurfer/from-custom-error-types-to-a-custom-error-subtype-3nkf


const responseCodes = {
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500
};

class HttpError extends Error {
    constructor({ message, name, statusCode, data }) {
        super(message);
        this.name = name;
        this.statusCode = statusCode;
        this.data = data;
        Error.captureStackTrace(this, HttpError);
    }
}

class HttpBadRequest extends HttpError {
    constructor(message = 'Bad request', data) {
        super({
            message,
            name: "HttpBadRequest",
            statusCode: responseCodes.BAD_REQUEST,
            data
        });
    }
}

class HttpNotFound extends HttpError {
    constructor(message = 'Not Found', data) {
        super({
            message,
            name: "HttpNotFound",
            statusCode: responseCodes.NOT_FOUND,
            data
        });
    }
}

class HttpForbidden extends HttpError {
    constructor(message = 'Forbidden', data) {
        super({
            message,
            name: 'HttpForbidden',
            statusCode: responseCodes.FORBIDDEN,
            data
        });
    }
};

class HttpInternalServerError extends HttpError {
    constructor(message = 'Internal server error', data) {
        super({
            message,
            name: "HttpInternalServerError",
            statusCode: responseCodes.INTERNAL_SERVER_ERROR,
            data
        });
    }
}

module.exports = {
    HttpError,
    HttpBadRequest,
    HttpNotFound,
    HttpForbidden,
    HttpInternalServerError
}