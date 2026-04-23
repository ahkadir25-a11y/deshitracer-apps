"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = __importDefault(require("../../config"));
const sendEmail = (options) => __awaiter(void 0, void 0, void 0, function* () {
    const transporter = nodemailer_1.default.createTransport({
        host: config_1.default.smptHost,
        port: config_1.default.smptPort,
        secure: true,
        auth: {
            user: config_1.default.nodemailerUser,
            pass: config_1.default.nodemailerPass,
        },
        debug: true, // Add this
        logger: true // And this
    });
    // Verify the connection configuration
    yield transporter.verify();
    const mailOptions = {
        from: config_1.default.nodemailerUser,
        to: options.email,
        subject: options.subject,
        html: options.message,
        headers: {
            'Content-Type': 'text/html; charset=UTF-8',
            'X-Mailer': 'Deshi Tracker Mailer',
            'Content-Language': 'en',
        },
    };
    try {
        // Sending the email and capturing the result
        const result = yield transporter.sendMail(mailOptions);
        // // Logging the message ID from the result
        // console.log(`Email sent successfully! Message ID: ${JSON.stringify(result)}`);
        // // Return the message ID or other relevant details
        return result === null || result === void 0 ? void 0 : result.messageId;
    }
    catch (error) {
        console.error(`Failed to send email: ${error === null || error === void 0 ? void 0 : error.message}`);
        throw new Error('Failed to send email');
    }
});
exports.default = sendEmail;
