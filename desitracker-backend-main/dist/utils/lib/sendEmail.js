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
// Create the transporter once at startup to reuse connections
const transporter = nodemailer_1.default.createTransport({
    host: config_1.default.smptHost,
    port: Number(config_1.default.smptPort),
    secure: Number(config_1.default.smptPort) === 465, // true for 465, false for other ports (like 587)
    auth: {
        user: config_1.default.nodemailerUser,
        pass: config_1.default.nodemailerPass,
    },
    // debug: true, // Only enable if needed
    // logger: true 
});
const sendEmail = (options) => __awaiter(void 0, void 0, void 0, function* () {
    // Show the business name as the sender's display name when provided, so a
    // recipient sees e.g. "Rech Tech" instead of the generic mailbox. SMTP only
    // allows our one authenticated address, but the display name is free-form.
    // Falls back to the company name, then the raw mailbox.
    const senderName = options.fromName || config_1.default.companyName || 'Deshi Tracker';
    const fromAddress = config_1.default.nodemailerUser;
    const from = `"${String(senderName).replace(/"/g, '')}" <${fromAddress}>`;
    const mailOptions = {
        from,
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
        return result === null || result === void 0 ? void 0 : result.messageId;
    }
    catch (error) {
        console.error(`Failed to send email to ${options.email}: ${error === null || error === void 0 ? void 0 : error.message}`);
        throw new Error(`Failed to send email: ${(error === null || error === void 0 ? void 0 : error.message) || error}`);
    }
});
exports.default = sendEmail;
