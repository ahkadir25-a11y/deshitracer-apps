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
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const routes_1 = __importDefault(require("./routes"));
const globalErrorHandler_1 = __importDefault(require("./middlewares/globalErrorHandler"));
const notFound_1 = __importDefault(require("./middlewares/notFound"));
const app = (0, express_1.default)();
const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://8dd9-123-253-215-113.ngrok-free.app',
    'https://deshi-tracker-frontend-bwt5.vercel.app',
    'http://desitracker.com',
    'https://desitracker.com',
    'https://www.desitracker.com',
    'http://www.desitracker.com'
];
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));
//parsers(middlewares)
app.use(express_1.default.json({ limit: '100mb' }));
app.use('/api/v1', routes_1.default);
const test = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.send('Business Tracker Server is running..');
});
app.get('/', test);
app.use(globalErrorHandler_1.default);
app.use(notFound_1.default);
exports.default = app;
