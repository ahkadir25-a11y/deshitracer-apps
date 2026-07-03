"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.emitToBusiness = exports.getSocketIO = exports.initSocket = void 0;
const socket_io_1 = require("socket.io");
const jwt_1 = require("./jwt");
const config_1 = __importDefault(require("../config"));
let io;
const initSocket = (server) => {
    io = new socket_io_1.Server(server, {
        cors: {
            origin: '*', // Adjust for production
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
        },
    });
    io.use((socket, next) => {
        var _a;
        try {
            const token = socket.handshake.auth.token || ((_a = socket.handshake.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1]);
            if (!token) {
                return next(new Error('Authentication error: No token provided'));
            }
            const decoded = jwt_1.JwtHelpers.verifyToken(token, config_1.default.jwt.accessSecret);
            // We attach the user ID and role, but we also expect the client to tell us which business room to join
            // since a user might be a staff member for a specific business.
            socket.user = decoded;
            next();
        }
        catch (err) {
            return next(new Error('Authentication error: Invalid token'));
        }
    });
    io.on('connection', (socket) => {
        console.log(`Socket connected: ${socket.id}`);
        // Client explicitly requests to join a business room. We MUST verify the
        // authenticated user actually belongs to that business, otherwise any
        // logged-in user could join any room and receive another tenant's realtime
        // orders/payments (cross-tenant data leak).
        socket.on('join_business', (businessId) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const user = socket.user;
                if (!user || !businessId)
                    return;
                // Admins can observe any business.
                if (user.role === 'admin') {
                    socket.join(`business_${businessId}`);
                    return;
                }
                const { Business } = yield Promise.resolve().then(() => __importStar(require('../modules/business/business.model')));
                const { RotaEmployee } = yield Promise.resolve().then(() => __importStar(require('../modules/rota/employee/employee.model')));
                const biz = yield Business.findById(businessId).select('owner').lean();
                const isOwner = !!biz && String(biz.owner) === String(user.id);
                let isStaff = false;
                if (!isOwner) {
                    const staff = yield RotaEmployee.exists({
                        business: businessId,
                        isDeleted: false,
                        $or: [
                            ...(user.id ? [{ user: user.id }] : []),
                            ...(user.email ? [{ email: String(user.email).toLowerCase() }] : []),
                        ],
                    });
                    isStaff = !!staff;
                }
                if (!isOwner && !isStaff) {
                    console.warn(`Socket ${socket.id} denied join for business_${businessId}`);
                    return;
                }
                socket.join(`business_${businessId}`);
                console.log(`Socket ${socket.id} joined room business_${businessId}`);
            }
            catch (err) {
                console.error('[socket] join_business check failed:', err === null || err === void 0 ? void 0 : err.message);
            }
        }));
        socket.on('leave_business', (businessId) => {
            socket.leave(`business_${businessId}`);
            console.log(`Socket ${socket.id} left room business_${businessId}`);
        });
        socket.on('disconnect', () => {
            console.log(`Socket disconnected: ${socket.id}`);
        });
    });
    return io;
};
exports.initSocket = initSocket;
const getSocketIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};
exports.getSocketIO = getSocketIO;
/**
 * Safely emit a real-time event to a business room. Never throws — if the socket
 * server isn't ready or the businessId is missing, it silently no-ops so it can be
 * dropped into any service/controller without risking the request.
 */
const emitToBusiness = (businessId, event, data) => {
    try {
        if (!io || !businessId)
            return;
        io.to(`business_${String(businessId)}`).emit(event, data !== null && data !== void 0 ? data : {});
    }
    catch (_a) {
        // real-time is best-effort — never break the mutation that triggered it
    }
};
exports.emitToBusiness = emitToBusiness;
