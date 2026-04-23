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
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendContactMessage = void 0;
const contactService_1 = require("./contactService");
// Controller to handle the contact form submission
const sendContactMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, message, phone } = req.body;
    // Validate input
    if (!name || !email || !message || !phone) {
        res.status(400).json({ error: 'Please provide all fields: name, email, message' });
        return;
    }
    const contactMessage = { name, email, message, phone };
    // Call the service to send the email
    const emailSent = yield (0, contactService_1.sendContactEmail)(contactMessage);
    if (emailSent) {
        res.status(200).json({ message: 'Message sent successfully' });
    }
    else {
        res.status(500).json({ error: 'There was an error sending the email' });
    }
});
exports.sendContactMessage = sendContactMessage;
