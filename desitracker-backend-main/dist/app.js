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
// import cookieParser from 'cookie-parser';
const compression_1 = __importDefault(require("compression"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const routes_1 = __importDefault(require("./routes"));
const globalErrorHandler_1 = __importDefault(require("./middlewares/globalErrorHandler"));
const notFound_1 = __importDefault(require("./middlewares/notFound"));
const app = (0, express_1.default)();
// Trust the reverse proxy (DigitalOcean/nginx) so rate-limit & secure cookies
// see the real client IP, not the proxy's.
app.set('trust proxy', 1);
// Security headers.
app.use((0, helmet_1.default)());
// Gzip-compress all responses — big win for mobile clients on slower networks
// (JSON lists shrink ~70-80%, so every screen loads faster).
app.use((0, compression_1.default)());
const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://deshi-tracker-frontend-bwt5.vercel.app',
    'https://desitracker.com',
    'https://www.desitracker.com',
];
app.use((0, cors_1.default)({
    // Note: the native mobile app sends requests with NO Origin header, so
    // `!origin` must stay allowed or the app breaks. Browser origins are
    // restricted to the HTTPS allow-list above.
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            // Reject the request without throwing — an Error here becomes an
            // unhandled rejection that crashes the whole process (server.ts
            // shuts the server down on any unhandledRejection/uncaughtException).
            callback(null, false);
        }
    },
    credentials: true,
}));
//parsers(middlewares)
app.use(express_1.default.json({ limit: '5mb' }));
// Strip any keys containing `$` or `.` from req.body/query/params to block
// NoSQL operator injection (e.g. { "email": { "$ne": null } }).
app.use((0, express_mongo_sanitize_1.default)());
// Global rate limit — coarse backstop against abuse/DoS.
app.use((0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
}));
// Tighter limits on credential / code endpoints (brute-force & OTP guessing).
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many attempts. Please try again later.' },
});
app.use('/api/v1/auth/login', authLimiter);
// NOTE: these paths must match the routes actually registered in auth.api.ts.
// The OTP flow lives at /forgot-password-code (not /request-reset-code), and the
// legacy web flow at /forgot-password + /reset-password/:token — all of which
// send email or accept reset tokens, so they must be throttled too.
app.use('/api/v1/auth/forgot-password', authLimiter);
app.use('/api/v1/auth/forgot-password-code', authLimiter);
app.use('/api/v1/auth/reset-password', authLimiter);
app.use('/api/v1/auth/reset-password-code', authLimiter);
app.use('/api/v1/members/login', authLimiter);
app.use('/api/v1', routes_1.default);
const test = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.send('Business Tracker Server is running..');
});
app.get('/', test);
// 404 for unmatched routes must run BEFORE the error handler.
app.use(notFound_1.default);
app.use(globalErrorHandler_1.default);
exports.default = app;
