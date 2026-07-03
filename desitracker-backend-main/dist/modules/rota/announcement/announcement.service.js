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
exports.AnnouncementService = void 0;
const AppError_1 = __importDefault(require("../../../errors/AppError"));
const announcement_model_1 = require("./announcement.model");
const rota_utils_1 = require("../rota.utils");
exports.AnnouncementService = {
    // OWNER — Create a new announcement for staff at this business.
    create(userId, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const business = rota_utils_1.RotaUtils.requireObjectId(payload === null || payload === void 0 ? void 0 : payload.business, 'business');
            const title = rota_utils_1.RotaUtils.requireString(payload === null || payload === void 0 ? void 0 : payload.title, 'title');
            const body = rota_utils_1.RotaUtils.requireString(payload === null || payload === void 0 ? void 0 : payload.body, 'body');
            const pinned = (payload === null || payload === void 0 ? void 0 : payload.pinned) === true || (payload === null || payload === void 0 ? void 0 : payload.pinned) === 'true';
            const expiresAt = (payload === null || payload === void 0 ? void 0 : payload.expiresAt) ? rota_utils_1.RotaUtils.parseDate(payload.expiresAt, 'expiresAt') : null;
            const doc = yield announcement_model_1.Announcement.create({
                business,
                author: userId,
                title,
                body,
                pinned,
                expiresAt,
                readBy: [],
            });
            return doc;
        });
    },
    // OWNER + STAFF — List announcements for a business. Filters out expired.
    list(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const business = rota_utils_1.RotaUtils.requireObjectId(query === null || query === void 0 ? void 0 : query.business, 'business');
            const { page, limit, skip } = rota_utils_1.RotaUtils.pagination(query, { page: 1, limit: 30, maxLimit: 100 });
            const now = new Date();
            const filter = {
                business,
                isDeleted: false,
                $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
            };
            const [data, total] = yield Promise.all([
                announcement_model_1.Announcement.find(filter)
                    .populate('author', 'name email')
                    .sort({ pinned: -1, createdAt: -1 })
                    .skip(skip)
                    .limit(limit),
                announcement_model_1.Announcement.countDocuments(filter),
            ]);
            return { meta: { page, limit, total }, data };
        });
    },
    // STAFF — Mark an announcement read for THIS user.
    markRead(userId, id, business) {
        return __awaiter(this, void 0, void 0, function* () {
            const doc = yield announcement_model_1.Announcement.findOneAndUpdate({ _id: id, business, isDeleted: false }, { $addToSet: { readBy: userId } }, { new: true });
            if (!doc)
                throw new AppError_1.default(404, 'Announcement not found');
            return doc;
        });
    },
    // STAFF — Unread count for this user. Drives the bell badge.
    unreadCount(userId, business) {
        return __awaiter(this, void 0, void 0, function* () {
            const now = new Date();
            const count = yield announcement_model_1.Announcement.countDocuments({
                business,
                isDeleted: false,
                readBy: { $ne: userId },
                $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
            });
            return { count };
        });
    },
    // OWNER — Edit an announcement (title/body/pinned/expiresAt).
    update(id, business, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const doc = yield announcement_model_1.Announcement.findOne({ _id: id, business, isDeleted: false });
            if (!doc)
                throw new AppError_1.default(404, 'Announcement not found');
            if ((payload === null || payload === void 0 ? void 0 : payload.title) !== undefined)
                doc.title = rota_utils_1.RotaUtils.requireString(payload.title, 'title');
            if ((payload === null || payload === void 0 ? void 0 : payload.body) !== undefined)
                doc.body = rota_utils_1.RotaUtils.requireString(payload.body, 'body');
            if ((payload === null || payload === void 0 ? void 0 : payload.pinned) !== undefined)
                doc.pinned = !!payload.pinned;
            if ((payload === null || payload === void 0 ? void 0 : payload.expiresAt) !== undefined) {
                doc.expiresAt = payload.expiresAt ? rota_utils_1.RotaUtils.parseDate(payload.expiresAt, 'expiresAt') : null;
            }
            yield doc.save();
            return doc;
        });
    },
    // OWNER — Soft delete.
    remove(id, business) {
        return __awaiter(this, void 0, void 0, function* () {
            const doc = yield announcement_model_1.Announcement.findOneAndUpdate({ _id: id, business, isDeleted: false }, { isDeleted: true }, { new: true });
            if (!doc)
                throw new AppError_1.default(404, 'Announcement not found');
            return doc;
        });
    },
};
