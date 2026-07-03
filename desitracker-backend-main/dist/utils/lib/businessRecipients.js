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
exports.resolveBusinessRecipients = void 0;
const business_model_1 = require("../../modules/business/business.model");
const user_model_1 = require("../../modules/user/user/user.model");
const employee_model_1 = require("../../modules/rota/employee/employee.model");
const isEmail = (s) => typeof s === 'string' && /\S+@\S+\.\S+/.test(s.trim());
/**
 * Resolve the people at a business who should receive a notification email.
 *
 * By default this is "the business owner": the owner's User.email plus the
 * business's registered contact email. Pass `{ includeStaff: true }` to also
 * include every ACTIVE staff member — use that only for low-frequency events
 * (e.g. reservations), not for every order, to avoid flooding staff inboxes.
 *
 * Always returns a result; on any lookup failure it returns whatever it could
 * resolve (possibly an empty recipient list) so callers can stay best-effort.
 */
const resolveBusinessRecipients = (businessId_1, ...args_1) => __awaiter(void 0, [businessId_1, ...args_1], void 0, function* (businessId, opts = {}) {
    var _a;
    const out = new Set();
    let businessName = 'your business';
    // Default both alerts ON — a business with no saved preference still gets
    // notified, and we only suppress when the owner explicitly turned it off.
    const notify = { emailOnNewOrder: true, emailOnNewReservation: true };
    try {
        const business = yield business_model_1.Business.findById(businessId)
            .select('businessName owner contactDetails.email notificationSettings')
            .lean();
        if (business) {
            businessName = business.businessName || businessName;
            const ns = business.notificationSettings;
            if (ns) {
                notify.emailOnNewOrder = ns.emailOnNewOrder !== false;
                notify.emailOnNewReservation = ns.emailOnNewReservation !== false;
            }
            const contactEmail = (_a = business === null || business === void 0 ? void 0 : business.contactDetails) === null || _a === void 0 ? void 0 : _a.email;
            if (isEmail(contactEmail))
                out.add(String(contactEmail).trim().toLowerCase());
            const ownerId = business.owner;
            if (ownerId) {
                const owner = yield user_model_1.User.findById(ownerId).select('email').lean();
                const ownerEmail = owner === null || owner === void 0 ? void 0 : owner.email;
                if (isEmail(ownerEmail))
                    out.add(String(ownerEmail).trim().toLowerCase());
            }
        }
        if (opts.includeStaff) {
            const staff = yield employee_model_1.RotaEmployee.find({
                business: businessId,
                status: 'ACTIVE',
                isDeleted: false,
            })
                .select('email')
                .lean();
            staff.forEach((s) => {
                if (isEmail(s === null || s === void 0 ? void 0 : s.email))
                    out.add(String(s.email).trim().toLowerCase());
            });
        }
    }
    catch (err) {
        console.error('[recipients] resolve failed:', err === null || err === void 0 ? void 0 : err.message);
    }
    return { businessName, recipients: Array.from(out), notify };
});
exports.resolveBusinessRecipients = resolveBusinessRecipients;
exports.default = exports.resolveBusinessRecipients;
