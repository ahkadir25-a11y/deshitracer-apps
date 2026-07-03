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
exports.requireBusinessOwnership = void 0;
const AppError_1 = __importDefault(require("../../errors/AppError"));
const handleAsyncRequest_1 = __importDefault(require("../../utils/handleAsyncRequest"));
const business_model_1 = require("../business/business.model");
const auth_constants_1 = require("../user/auth/auth.constants");
/**
 * Ensures the authenticated user owns the business referenced by the request.
 * Admins bypass the check. Looks for the business id in (in order):
 *   req.body.business, req.query.business, req.params.business
 *
 * Use this AFTER `auth(...)` middleware so `req.user` is populated.
 */
exports.requireBusinessOwnership = (0, handleAsyncRequest_1.default)((req, _res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    if (!user)
        throw new AppError_1.default(401, 'Not authenticated');
    // Admins can manage any business.
    if (user.role === auth_constants_1.USER_ROLE.ADMIN)
        return next();
    const businessId = (req.body && req.body.business) ||
        (req.query && req.query.business) ||
        (req.params && req.params.business);
    if (!businessId) {
        throw new AppError_1.default(400, 'business id is required');
    }
    const biz = yield business_model_1.Business.findById(businessId).select('owner');
    if (!biz)
        throw new AppError_1.default(404, 'Business not found');
    if (String(biz.owner) !== String(user.id)) {
        throw new AppError_1.default(403, 'You do not own this business');
    }
    next();
}));
