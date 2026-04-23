"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Category = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const categorySchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: [true, 'Please enter category name'],
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
    subCategories: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'Subcategory',
            default: [],
        },
    ],
}, {
    timestamps: true,
});
exports.Category = mongoose_1.default.model('Category', categorySchema);
