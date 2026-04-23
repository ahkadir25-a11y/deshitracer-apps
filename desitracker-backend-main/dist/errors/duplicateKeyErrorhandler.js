"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const duplicateKeyErrorHandler = (err) => {
    const match = err.message.match(/"([^"]+)"/);
    // Check if a match is found and extract the value
    const extractedValue = match && match[1];
    const statusCode = 400;
    const errorSources = [
        {
            path: '',
            message: `${extractedValue} is already exists`,
        },
    ];
    return {
        statusCode,
        message: 'already exists in database',
        errorSources,
    };
};
exports.default = duplicateKeyErrorHandler;
