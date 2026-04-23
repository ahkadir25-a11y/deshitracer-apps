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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DayOffer = void 0;
// models/dayOffer.model.ts
const mongoose_1 = __importStar(require("mongoose"));
const DayOfferSchema = new mongoose_1.Schema({
    user_id: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    business_id: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Business', required: true },
    product_category_id: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'ProductCategory' },
    day: {
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        required: true,
    },
    discount_percent: { type: Number, min: 0, max: 100, required: true },
    start_date: { type: Date, required: true },
    end_date: { type: Date, default: null },
}, { timestamps: true });
// Enforce at most one offer per weekday per business
DayOfferSchema.index({ business_id: 1, day: 1 }, { unique: true });
// Helpful secondary index for date-window queries
DayOfferSchema.index({ business_id: 1, start_date: 1, end_date: 1 });
exports.DayOffer = mongoose_1.default.model('DayOffer', DayOfferSchema);
exports.default = exports.DayOffer;
