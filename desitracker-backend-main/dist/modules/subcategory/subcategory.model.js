"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Subcategory = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const subcategorySchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    icon: {
        type: String,
        trim: true,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    details: {
        type: String,
        maxlength: [500, 'Details cannot exceed 500 characters'],
    },
    parentCategory: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
    },
}, { timestamps: true });
exports.Subcategory = mongoose_1.default.model('Subcategory', subcategorySchema);
