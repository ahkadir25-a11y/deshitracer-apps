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
exports.authOrderRead = exports.requireBusinessAccess = void 0;
exports.resolvePrincipal = resolvePrincipal;
exports.isBusinessMember = isBusinessMember;
exports.canAccessUserScopedData = canAccessUserScopedData;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../../config"));
const config_2 = require("../../middlewares/config");
const AppError_1 = __importDefault(require("../../errors/AppError"));
const auth_constants_1 = require("../../modules/user/auth/auth.constants");
/**
 * Resolve the caller from the Bearer token, accepting BOTH a user token
 * (signed with the access secret) and a member token (signed with the member
 * secret). Returns null when there's no valid token. Used by endpoints that are
 * reachable by both staff (user token) and customers (member token), e.g. the
 * orders list where customers read their own history.
 */
function resolvePrincipal(req) {
    return __awaiter(this, void 0, void 0, function* () {
        const header = req.headers.authorization;
        if (!header || !header.startsWith('Bearer '))
            return null;
        const token = header.slice(7).trim();
        try {
            const d = jsonwebtoken_1.default.verify(token, config_1.default.jwt.accessSecret);
            if (d === null || d === void 0 ? void 0 : d.id)
                return { id: String(d.id), role: String(d.role || 'user'), email: d.email };
        }
        catch (_a) {
            /* not a user token — fall through to member */
        }
        try {
            const m = jsonwebtoken_1.default.verify(token, config_2.config.memberJwtSecret);
            if ((m === null || m === void 0 ? void 0 : m.type) === 'member' && (m === null || m === void 0 ? void 0 : m.id))
                return { id: String(m.id), role: 'member' };
        }
        catch (_b) {
            /* not a member token either */
        }
        return null;
    });
}
/**
 * True when the principal is an admin, the owner of the business, or active
 * staff of it. Mirrors the membership check used by the realtime socket layer
 * (utils/socket.ts) so HTTP and socket authorization stay consistent.
 */
function isBusinessMember(principal, businessId) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!businessId)
            return false;
        if (principal.role === auth_constants_1.USER_ROLE.ADMIN)
            return true;
        const { Business } = yield Promise.resolve().then(() => __importStar(require('../../modules/business/business.model')));
        const biz = yield Business.findById(businessId).select('owner').lean();
        if (biz && String(biz.owner) === principal.id)
            return true;
        const { RotaEmployee } = yield Promise.resolve().then(() => __importStar(require('../../modules/rota/employee/employee.model')));
        const staff = yield RotaEmployee.exists({
            business: businessId,
            isDeleted: false,
            $or: [
                ...(principal.id ? [{ user: principal.id }] : []),
                ...(principal.email ? [{ email: String(principal.email).toLowerCase() }] : []),
            ],
        });
        return !!staff;
    });
}
/**
 * For data models keyed by a single user id (fridge, cleaning) where records
 * belong to the business OWNER's user id and staff access them by passing that
 * owner id (see StaffHomeScreen navigating with `userId: ownerUserId`).
 *
 * A caller may access the target user's data when:
 *   - caller is admin, OR
 *   - caller IS that user (owner viewing their own data), OR
 *   - caller is active staff of a business owned by the target user.
 */
function canAccessUserScopedData(callerId, callerRole, targetUserId, callerEmail) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!callerId || !targetUserId)
            return false;
        if (callerRole === auth_constants_1.USER_ROLE.ADMIN)
            return true;
        if (String(callerId) === String(targetUserId))
            return true;
        const { Business } = yield Promise.resolve().then(() => __importStar(require('../../modules/business/business.model')));
        const ownerBusinesses = yield Business.find({ owner: targetUserId }).distinct('_id');
        if (!ownerBusinesses.length)
            return false;
        const { RotaEmployee } = yield Promise.resolve().then(() => __importStar(require('../../modules/rota/employee/employee.model')));
        const staff = yield RotaEmployee.exists({
            business: { $in: ownerBusinesses },
            isDeleted: false,
            $or: [
                { user: callerId },
                ...(callerEmail ? [{ email: String(callerEmail).toLowerCase() }] : []),
            ],
        });
        return !!staff;
    });
}
const pickBusinessId = (req) => {
    const b = req.body || {};
    const q = req.query || {};
    const p = req.params || {};
    return (b.business_id || q.business_id || p.businessId || b.business || q.business || p.business);
};
/**
 * Use AFTER `auth(...)` (so `req.user` is populated). Confirms the authenticated
 * user is owner/staff/admin of the business referenced anywhere in the request
 * (body.business_id, query.business_id, params.businessId, or `business`).
 */
const requireBusinessAccess = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!(user === null || user === void 0 ? void 0 : user.id))
            throw new AppError_1.default(401, 'Not authenticated');
        const businessId = pickBusinessId(req);
        if (!businessId)
            throw new AppError_1.default(400, 'business id is required');
        const ok = yield isBusinessMember({ id: String(user.id), role: String(user.role), email: user.email }, String(businessId));
        if (!ok)
            throw new AppError_1.default(403, 'You are not authorized for this business');
        next();
    }
    catch (e) {
        next(e);
    }
});
exports.requireBusinessAccess = requireBusinessAccess;
/**
 * Guard for GET /orders, which is reachable by staff (business scope) AND by
 * customers (their own history). Accepts a user OR member token and enforces:
 *   ?business_id=X -> caller must be owner/staff/admin of X
 *   ?user_id=X     -> caller must be that user (or an admin)
 */
const authOrderRead = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const principal = yield resolvePrincipal(req);
        if (!principal)
            throw new AppError_1.default(401, 'Login required to view orders');
        const businessId = req.query.business_id;
        const userId = req.query.user_id;
        if (businessId) {
            const ok = yield isBusinessMember(principal, businessId);
            if (!ok)
                throw new AppError_1.default(403, 'You are not authorized for this business');
        }
        else if (userId) {
            if (principal.role !== auth_constants_1.USER_ROLE.ADMIN && String(userId) !== principal.id) {
                throw new AppError_1.default(403, 'You can only view your own orders');
            }
        }
        else {
            throw new AppError_1.default(400, 'business_id or user_id is required');
        }
        next();
    }
    catch (e) {
        next(e);
    }
});
exports.authOrderRead = authOrderRead;
