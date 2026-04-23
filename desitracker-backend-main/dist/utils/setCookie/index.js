"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setCookie = void 0;
const config_1 = __importDefault(require("../../config"));
const setCookie = (token, res) => {
    // set refresh token to cookie
    res.cookie('accessToken', token, {
        secure: config_1.default.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'none',
        maxAge: 1000 * 60 * 60 * 24 * 365,
    });
};
exports.setCookie = setCookie;
