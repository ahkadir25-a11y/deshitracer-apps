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
exports.AnnouncementController = void 0;
const rota_utils_1 = require("../rota.utils");
const announcement_service_1 = require("./announcement.service");
function requireUserId(req) {
    const user = req.user;
    if (!(user === null || user === void 0 ? void 0 : user.id)) {
        const e = new Error('Not authenticated');
        e.statusCode = 401;
        throw e;
    }
    return user.id;
}
exports.AnnouncementController = {
    create: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const userId = requireUserId(req);
            const result = yield announcement_service_1.AnnouncementService.create(userId, req.body);
            res.status(201).json({ success: true, message: 'Announcement posted', data: result });
        }
        catch (err) {
            next(err);
        }
    }),
    list: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const result = yield announcement_service_1.AnnouncementService.list(req.query);
            res.status(200).json({
                success: true,
                message: 'Announcements fetched',
                meta: result.meta,
                data: result.data,
            });
        }
        catch (err) {
            next(err);
        }
    }),
    markRead: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const userId = requireUserId(req);
            const id = rota_utils_1.RotaUtils.requireObjectId(req.params.id, 'id');
            const business = rota_utils_1.RotaUtils.requireObjectId(req.query.business, 'business');
            const result = yield announcement_service_1.AnnouncementService.markRead(userId, id, business);
            res.status(200).json({ success: true, message: 'Marked as read', data: result });
        }
        catch (err) {
            next(err);
        }
    }),
    unreadCount: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const userId = requireUserId(req);
            const business = rota_utils_1.RotaUtils.requireObjectId(req.query.business, 'business');
            const result = yield announcement_service_1.AnnouncementService.unreadCount(userId, business);
            res.status(200).json({ success: true, message: 'Unread count', data: result });
        }
        catch (err) {
            next(err);
        }
    }),
    update: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const id = rota_utils_1.RotaUtils.requireObjectId(req.params.id, 'id');
            const business = rota_utils_1.RotaUtils.requireObjectId(req.query.business, 'business');
            const result = yield announcement_service_1.AnnouncementService.update(id, business, req.body);
            res.status(200).json({ success: true, message: 'Announcement updated', data: result });
        }
        catch (err) {
            next(err);
        }
    }),
    remove: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const id = rota_utils_1.RotaUtils.requireObjectId(req.params.id, 'id');
            const business = rota_utils_1.RotaUtils.requireObjectId(req.query.business, 'business');
            const result = yield announcement_service_1.AnnouncementService.remove(id, business);
            res.status(200).json({ success: true, message: 'Announcement deleted', data: result });
        }
        catch (err) {
            next(err);
        }
    }),
};
