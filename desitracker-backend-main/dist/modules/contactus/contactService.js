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
exports.sendContactEmail = void 0;
const sendEmail_1 = __importDefault(require("../../utils/lib/sendEmail"));
const ADMIN_EMAIL = 'info.desitracker@gmail.com';
// Service to send contact email
const sendContactEmail = (contact) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, message, phone } = contact;
    try {
        // 1️⃣ Send email to Admin
        yield (0, sendEmail_1.default)({
            email: ADMIN_EMAIL,
            subject: `New Contact Us Message from ${name}`,
            message: `
        <h2>New Contact Message Received</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
        });
        // 2️⃣ Send Thank You Email to User
        yield (0, sendEmail_1.default)({
            email: email,
            subject: `Thank You for Contacting Us, ${name}!`,
            message: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #2C18C6;">Thank You for Reaching Out!</h2>
          <p>Hi ${name},</p>
          <p>We have received your message and our team will get back to you as soon as possible. Here's a summary of what you sent us:</p>
          <hr>
          <p><strong>Your Message:</strong></p>
          <blockquote style="border-left: 4px solid #2C18C6; padding-left: 10px; color: #555;">
            ${message.replace(/\n/g, '<br>')}
          </blockquote>
          <hr>
          <p>If you need immediate assistance, feel free to contact us at <a href="mailto:${ADMIN_EMAIL}">${ADMIN_EMAIL}</a>.</p>
          <p>Thank you for choosing DesiTracker!</p>
          <br>
          <p>Best regards,<br>The DesiTracker Team</p>
        </div>
      `,
        });
        return true;
    }
    catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
});
exports.sendContactEmail = sendContactEmail;
