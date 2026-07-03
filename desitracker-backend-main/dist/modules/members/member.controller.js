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
exports.sendPromotionToLeadsController = exports.listMyLeadsController = exports.removeLeadController = exports.addLeadController = exports.acceptDeactivationRequestController = exports.listDeactivationRequestsController = exports.myDeactivationRequestsController = exports.createDeactivationRequestController = exports.getRestaurantOffersController = exports.setStatusBySerialController = exports.pagedSearchMembersController = exports.searchBySerialController = exports.lookupBySerialController = exports.verifyBySlugController = exports.getScanHistoryController = exports.savePushTokenController = exports.deleteMeController = exports.setStatusController = exports.uploadProfileImageController = exports.updateMeController = exports.meController = exports.loginController = exports.registerController = void 0;
const memberService = __importStar(require("./member.service"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../../middlewares/config");
const handleAsyncRequest_1 = __importDefault(require("../../utils/handleAsyncRequest"));
function signMember(memberId) {
    const secret = config_1.config.memberJwtSecret;
    const options = {
        expiresIn: config_1.config.memberJwtExpiresIn,
    };
    return jsonwebtoken_1.default.sign({ id: memberId, type: 'member' }, secret, options);
}
// ---------- Public (unchanged signatures are OK) ----------
const registerController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const m = yield memberService.registerMember(req.body);
        const token = signMember(m._id.toString());
        res.status(201).json({
            token,
            member: {
                id: m._id, name: m.name, phone: m.phone, city: m.city,
                serialNumber: m === null || m === void 0 ? void 0 : m.serialNumber, qrCodeUrl: m.qrCodeUrl, active: m.active,
            }
        });
    }
    catch (e) {
        res.status(400).json({ message: e.message || 'Registration failed' });
    }
});
exports.registerController = registerController;
const loginController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const m = yield memberService.authenticateMember(req.body.phone, req.body.password);
        const token = signMember(m._id.toString());
        res.json({
            token,
            member: {
                id: m._id, name: m.name, phone: m.phone, city: m.city,
                serialNumber: m === null || m === void 0 ? void 0 : m.serialNumber, qrCodeUrl: m.qrCodeUrl, active: m.active,
            }
        });
    }
    catch (e) {
        res.status(400).json({ message: e.message || 'Invalid credentials' });
    }
});
exports.loginController = loginController;
// ---------- Authenticated (must be RequestHandler + no return res...) ----------
const meController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const m = yield memberService.getMemberById(req.member.id);
    if (!m) {
        res.status(404).json({ message: 'Not found' });
        return;
    }
    res.json({
        id: m._id, name: m.name, phone: m.phone, city: m.city,
        profileImageUrl: m.profileImageUrl,
        serialNumber: m === null || m === void 0 ? void 0 : m.serialNumber, qrCodeUrl: m.qrCodeUrl,
        info: `Deshi Tracker active member with serial number ${m === null || m === void 0 ? void 0 : m.serialNumber}`,
        active: m.active
    });
});
exports.meController = meController;
const updateMeController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const m = yield memberService.updateMember(req.member.id, {
        name: req.body.name, phone: req.body.phone, city: req.body.city
    });
    res.json({ id: m === null || m === void 0 ? void 0 : m._id, name: m === null || m === void 0 ? void 0 : m.name, phone: m === null || m === void 0 ? void 0 : m.phone, city: m === null || m === void 0 ? void 0 : m.city });
});
exports.updateMeController = updateMeController;
const uploadProfileImageController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const file = req.file;
        if (!file) {
            res.status(400).json({ message: 'No file provided' });
            return;
        }
        const imageUrl = yield memberService.uploadProfileImage(req.member.id, file.path);
        res.json({ profileImageUrl: imageUrl });
    }
    catch (e) {
        res.status(500).json({ message: e.message || 'Upload failed' });
    }
});
exports.uploadProfileImageController = uploadProfileImageController;
const setStatusController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const updated = yield memberService.setActiveStatus(req.member.id, req.body.active);
    res.json({ active: updated === null || updated === void 0 ? void 0 : updated.active });
});
exports.setStatusController = setStatusController;
const deleteMeController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield memberService.deleteMember(req.member.id);
    res.json({ message: 'Account deleted and all data removed.' });
});
exports.deleteMeController = deleteMeController;
const savePushTokenController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const token = (_a = req.body) === null || _a === void 0 ? void 0 : _a.token;
    if (!token || typeof token !== 'string') {
        res.status(400).json({ message: 'Field "token" is required' });
        return;
    }
    yield memberService.saveMemberPushToken(req.member.id, token);
    res.json({ ok: true });
});
exports.savePushTokenController = savePushTokenController;
exports.getScanHistoryController = (0, handleAsyncRequest_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const memberId = req.member.id;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const data = yield memberService.getScanHistory(memberId, page, limit);
    res.json(data);
}));
// ---------- Wrapped controllers must be Promise<void> and never return Response ----------
exports.verifyBySlugController = (0, handleAsyncRequest_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const businessId = typeof req.query.businessId === 'string' ? req.query.businessId : undefined;
    const businessName = typeof req.query.businessName === 'string' ? req.query.businessName : undefined;
    const data = yield memberService.verifyBySlug(req.params.slug, businessId, businessName);
    res.json(data);
}));
exports.lookupBySerialController = (0, handleAsyncRequest_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield memberService.lookupBySerial(req.params.serial);
    if (!data) {
        res.status(404).json({ message: 'Member not found' });
        return;
    }
    res.json(data);
}));
exports.searchBySerialController = (0, handleAsyncRequest_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const serial = String(req.query.serial || '').trim();
    if (!serial) {
        res.status(400).json({ message: 'Query parameter "serial" is required' });
        return;
    }
    const data = yield memberService.searchMemberBySerial(serial);
    if (!data) {
        res.status(404).json({ message: 'Member not found' });
        return;
    }
    res.json(data);
}));
exports.pagedSearchMembersController = (0, handleAsyncRequest_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const q = typeof req.query.q === 'string' ? req.query.q : undefined;
    const page = Number.parseInt(String((_a = req.query.page) !== null && _a !== void 0 ? _a : '1'), 10) || 1;
    const limit = Number.parseInt(String((_b = req.query.limit) !== null && _b !== void 0 ? _b : '10'), 10) || 10;
    const data = yield memberService.pagedMemberSearch({ q, page, limit });
    res.json(data);
}));
exports.setStatusBySerialController = (0, handleAsyncRequest_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { serial, active } = req.body;
    if (!serial || typeof active !== 'boolean') {
        res.status(400).json({ message: 'Fields "serial" (string) and "active" (boolean) are required' });
        return;
    }
    try {
        const data = yield memberService.setActiveStatusBySerial(serial, active);
        res.json(data);
    }
    catch (e) {
        if ((e === null || e === void 0 ? void 0 : e.message) === 'Member not found') {
            res.status(404).json({ message: 'Member not found' });
            return;
        }
        res.status(500).json({ message: (e === null || e === void 0 ? void 0 : e.message) || 'Update failed' });
    }
}));
// Restaurant offers (also Promise<void>)
exports.getRestaurantOffersController = (0, handleAsyncRequest_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const city = typeof req.query.city === 'string' ? req.query.city.trim() : undefined;
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : undefined;
    const country = typeof req.query.country === 'string' ? req.query.country.trim() : undefined; // <-- Add country
    const min_discount_raw = req.query.min_discount;
    const min_discount = typeof min_discount_raw === 'string' && min_discount_raw.trim() !== ''
        ? Math.max(0, Math.min(100, Number(min_discount_raw)))
        : undefined;
    const page = Number.parseInt(String((_a = req.query.page) !== null && _a !== void 0 ? _a : '1'), 10) || 1;
    const limit = Number.parseInt(String((_b = req.query.limit) !== null && _b !== void 0 ? _b : '12'), 10) || 12;
    const result = yield memberService.findRestaurantOffers({
        city, q, min_discount, page, limit, country
    });
    res.json(result);
}));
exports.createDeactivationRequestController = (0, handleAsyncRequest_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const memberId = req.member.id;
    const { reason, note } = (req.body || {});
    const doc = yield memberService.createDeactivationRequest({ memberId, reason, note });
    res.status(201).json({ id: doc._id, status: doc.status, createdAt: doc.createdAt });
}));
exports.myDeactivationRequestsController = (0, handleAsyncRequest_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const memberId = req.member.id;
    const items = yield memberService.listMyDeactivationRequests(memberId);
    res.json(items);
}));
exports.listDeactivationRequestsController = (0, handleAsyncRequest_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const status = typeof req.query.status === 'string' && ['pending', 'accepted', 'rejected'].includes(req.query.status)
        ? req.query.status
        : undefined;
    const q = typeof req.query.q === 'string' ? req.query.q : undefined;
    const page = Number.parseInt(String((_a = req.query.page) !== null && _a !== void 0 ? _a : '1'), 10) || 1;
    const limit = Number.parseInt(String((_b = req.query.limit) !== null && _b !== void 0 ? _b : '20'), 10) || 20;
    const data = yield memberService.listDeactivationRequests({ status, q, page, limit });
    res.json(data);
}));
exports.acceptDeactivationRequestController = (0, handleAsyncRequest_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const id = req.params.id;
    const processedBy = req.headers['x-api-key'] || undefined;
    const processedNote = typeof ((_a = req.body) === null || _a === void 0 ? void 0 : _a.note) === 'string' ? req.body.note : undefined;
    const data = yield memberService.acceptDeactivationRequest(id, processedBy, processedNote);
    res.json(data);
}));
exports.addLeadController = (0, handleAsyncRequest_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // Owner identity comes from the authenticated token — NEVER the request body.
    // Previously `ownerId` was attacker-controlled, so any business user could
    // add/read/modify another owner's leads (cross-tenant IDOR).
    const ownerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const { memberId } = (req.body || {});
    if (!ownerId) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
    }
    if (!memberId) {
        res.status(400).json({ message: 'Field "memberId" is required' });
        return;
    }
    try {
        const data = yield memberService.addLead(ownerId, memberId);
        res.status(201).json(data);
    }
    catch (e) {
        const msg = (e === null || e === void 0 ? void 0 : e.message) || 'Failed to add lead';
        if (msg === 'Already added as lead') {
            res.status(409).json({ message: msg });
            return;
        }
        if (msg === 'Member not found') {
            res.status(404).json({ message: msg });
            return;
        }
        res.status(400).json({ message: msg });
    }
}));
exports.removeLeadController = (0, handleAsyncRequest_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const ownerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!ownerId) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
    }
    const leadMemberId = req.params.memberId;
    if (!leadMemberId) {
        res.status(400).json({ message: 'Param "memberId" is required' });
        return;
    }
    try {
        const data = yield memberService.removeLead(ownerId, leadMemberId);
        res.json(data);
    }
    catch (e) {
        const msg = (e === null || e === void 0 ? void 0 : e.message) || 'Failed to remove lead';
        if (msg === 'Lead not found') {
            res.status(404).json({ message: msg });
            return;
        }
        res.status(400).json({ message: msg });
    }
}));
exports.listMyLeadsController = (0, handleAsyncRequest_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const ownerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!ownerId) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
    }
    const q = typeof req.query.q === 'string' ? req.query.q : undefined;
    const page = Number.parseInt(String((_b = req.query.page) !== null && _b !== void 0 ? _b : '1'), 10) || 1;
    const limit = Number.parseInt(String((_c = req.query.limit) !== null && _c !== void 0 ? _c : '20'), 10) || 20;
    const data = yield memberService.listMyLeads({ ownerMemberId: ownerId, q, page, limit });
    res.json(data);
}));
exports.sendPromotionToLeadsController = (0, handleAsyncRequest_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { offerId, subject, message } = (req.body || {});
    // Sender identity from the token only — stops one owner blasting promos to
    // another owner's leads by passing an arbitrary ownerId.
    const ownerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!ownerId) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
    }
    if (!offerId) {
        res.status(400).json({ message: 'Field "offerId" is required' });
        return;
    }
    const result = yield memberService.sendPromotionToLeads({
        ownerMemberId: ownerId,
        offerId,
        subject,
        message,
    });
    res.json(result);
}));
