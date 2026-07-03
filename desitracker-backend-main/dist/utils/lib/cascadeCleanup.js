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
exports.cleanupBusinessRelations = cleanupBusinessRelations;
exports.cleanupUserRelations = cleanupUserRelations;
const mongoose_1 = __importDefault(require("mongoose"));
/**
 * Cascade cleanup helpers.
 *
 * Problem these solve:
 *  - Deleting a Business previously left its staff, orders, bookings, reviews,
 *    shifts, etc. pointing at a now-deleted business → orphaned records that
 *    crash screens when they try to .populate() the missing business.
 *  - Deleting a User (owner) left their Business records pointing at a ghost
 *    owner, and staff Users pointing at nothing.
 *
 * Design notes:
 *  - We AUTO-DISCOVER every model that references 'Business' by scanning the
 *    Mongoose schema for any path whose `ref === 'Business'`. This means new
 *    models added in the future are cleaned up automatically — nothing to
 *    maintain here.
 *  - Models that support soft-delete (have an `isDeleted` field) are
 *    soft-deleted so the data stays recoverable and consistent with the rest
 *    of the codebase. Models without it are hard-deleted.
 *  - Every step is wrapped in try/catch so one failing collection can never
 *    block the rest of the cleanup.
 */
/** Returns the field names on a model's schema that reference 'Business'. */
function getBusinessRefFields(model) {
    const fields = [];
    model.schema.eachPath((pathName, schemaType) => {
        var _a, _b, _c, _d;
        const ref = (_b = (_a = schemaType === null || schemaType === void 0 ? void 0 : schemaType.options) === null || _a === void 0 ? void 0 : _a.ref) !== null && _b !== void 0 ? _b : (_d = (_c = schemaType === null || schemaType === void 0 ? void 0 : schemaType.caster) === null || _c === void 0 ? void 0 : _c.options) === null || _d === void 0 ? void 0 : _d.ref; // handles arrays of ObjectId refs
        if (ref === 'Business')
            fields.push(pathName);
    });
    return fields;
}
/**
 * Soft/hard-deletes every record (across all collections) that belongs to the
 * given business, then soft-deletes any staff User accounts that no longer
 * belong to an active business.
 */
function cleanupBusinessRelations(businessId) {
    return __awaiter(this, void 0, void 0, function* () {
        const models = mongoose_1.default.connection.models;
        for (const name of Object.keys(models)) {
            if (name === 'Business')
                continue; // handled by the caller
            const model = models[name];
            const refFields = getBusinessRefFields(model);
            if (refFields.length === 0)
                continue;
            const filter = { $or: refFields.map((f) => ({ [f]: businessId })) };
            try {
                const supportsSoftDelete = Boolean(model.schema.path('isDeleted'));
                if (supportsSoftDelete) {
                    yield model.updateMany(filter, { $set: { isDeleted: true } });
                }
                else {
                    yield model.deleteMany(filter);
                }
            }
            catch (err) {
                console.warn(`[cascade] failed cleaning ${name} for business ${businessId}:`, err === null || err === void 0 ? void 0 : err.message);
            }
        }
        // Soft-delete staff logins that are now left without any active business.
        // (Runs AFTER the loop above, which already marked their RotaEmployee
        //  records isDeleted, so the "still active" count is accurate.)
        try {
            const RotaEmployee = models['RotaEmployee'];
            const User = models['User'];
            if (RotaEmployee && User) {
                const employees = yield RotaEmployee.find({
                    business: businessId,
                    user: { $ne: null },
                }).select('user');
                for (const emp of employees) {
                    if (!emp.user)
                        continue;
                    const stillActive = yield RotaEmployee.countDocuments({
                        user: emp.user,
                        isDeleted: false,
                    });
                    if (stillActive === 0) {
                        yield User.updateMany({ _id: emp.user, role: 'staff' }, { $set: { isDeleted: true } });
                    }
                }
            }
        }
        catch (err) {
            console.warn(`[cascade] failed cleaning staff users for business ${businessId}:`, err === null || err === void 0 ? void 0 : err.message);
        }
    });
}
/**
 * Called before a User is deleted. Cascades into:
 *  - Any businesses they OWN (soft-deletes each + cleans its relations), and
 *  - Any staff RotaEmployee records linked to this user (soft-deleted).
 */
function cleanupUserRelations(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const models = mongoose_1.default.connection.models;
        try {
            const Business = models['Business'];
            if (Business) {
                const owned = yield Business.find({
                    owner: userId,
                    isDeleted: false,
                }).select('_id');
                for (const b of owned) {
                    yield cleanupBusinessRelations(b._id);
                    yield Business.updateOne({ _id: b._id }, { $set: { isDeleted: true } });
                }
            }
        }
        catch (err) {
            console.warn(`[cascade] failed cleaning owned businesses for user ${userId}:`, err === null || err === void 0 ? void 0 : err.message);
        }
        try {
            const RotaEmployee = models['RotaEmployee'];
            if (RotaEmployee) {
                yield RotaEmployee.updateMany({ user: userId }, { $set: { isDeleted: true } });
            }
        }
        catch (err) {
            console.warn(`[cascade] failed cleaning employee records for user ${userId}:`, err === null || err === void 0 ? void 0 : err.message);
        }
    });
}
