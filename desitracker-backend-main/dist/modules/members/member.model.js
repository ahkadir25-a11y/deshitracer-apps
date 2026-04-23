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
exports.Member = void 0;
exports.getNextSerial = getNextSerial;
const mongoose_1 = __importStar(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const MemberSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true, index: true },
    email: { type: String, unique: true, sparse: true },
    password: { type: String, required: true, select: false },
    city: { type: String },
    profileImageUrl: { type: String },
    serialNumber: { type: String, required: true, unique: true, index: true },
    qrSlug: { type: String, required: true, unique: true, index: true },
    qrCodeUrl: { type: String },
    active: { type: Boolean, default: true },
    deletedAt: { type: Date, default: null },
}, { timestamps: true });
MemberSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        const doc = this;
        if (doc.isModified('password')) {
            const salt = yield bcryptjs_1.default.genSalt(10);
            doc.password = yield bcryptjs_1.default.hash(doc.password, salt);
        }
        next();
    });
});
MemberSchema.methods.comparePassword = function (candidate) {
    return bcryptjs_1.default.compare(candidate, this.password);
};
exports.Member = mongoose_1.default.model('Member', MemberSchema);
const CounterSchema = new mongoose_1.Schema({
    key: { type: String, unique: true },
    seq: { type: Number, default: 0 }
});
const Counter = mongoose_1.default.model('Counter', CounterSchema);
function getNextSerial() {
    return __awaiter(this, void 0, void 0, function* () {
        const year = new Date().getFullYear();
        const doc = yield Counter.findOneAndUpdate({ key: `member-${year}` }, { $inc: { seq: 1 } }, { new: true, upsert: true });
        const padded = String(doc.seq).padStart(6, '0');
        return `DT-${year}-${padded}`;
    });
}
