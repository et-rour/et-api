export {}
const config = require('../config/config');

class ApiError extends Error {
    statusCode: any;
    isOperational: boolean;

    constructor(statusCode: any, message: any, isOperational = true, stack = '') {
        super(message.replace('Firebase', 'Backend'));
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

module.exports = ApiError;