"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireMemberAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("./config");
const requireMemberAuth = (req, res, next) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    const token = header.slice('Bearer '.length).trim();
    let payload;
    try {
        // Ensure secret is typed as jwt.Secret
        const secret = config_1.config.memberJwtSecret;
        payload = jsonwebtoken_1.default.verify(token, secret);
    }
    catch (_a) {
        res.status(401).json({ message: 'Invalid or expired token' });
        return;
    }
    if (payload.type !== 'member') {
        res.status(401).json({ message: 'Invalid token type' });
        return;
    }
    // Cast to your extended request to attach member
    req.member = { id: payload.id };
    next();
};
exports.requireMemberAuth = requireMemberAuth;
