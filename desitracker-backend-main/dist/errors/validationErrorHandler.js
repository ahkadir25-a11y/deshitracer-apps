"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validationErrorHandler = (err) => {
    const statusCode = 400;
    const errorSources = Object.values(err === null || err === void 0 ? void 0 : err.errors).map((error) => {
        return {
            path: error === null || error === void 0 ? void 0 : error.path,
            message: error === null || error === void 0 ? void 0 : error.message,
        };
    });
    return {
        statusCode,
        message: 'Data validation Error',
        errorSources,
    };
};
exports.default = validationErrorHandler;
