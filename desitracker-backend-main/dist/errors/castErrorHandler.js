"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const castErrorHandler = (err) => {
    const statusCode = 400;
    const errorSources = [
        {
            path: err.path,
            message: err.message,
        },
    ];
    return {
        statusCode,
        message: 'Cast Error: Invalid ID',
        errorSources,
    };
};
exports.default = castErrorHandler;
