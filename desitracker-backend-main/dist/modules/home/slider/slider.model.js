"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Slider = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const sliderSchema = new mongoose_1.default.Schema({
    public_id: {
        type: String,
        required: true,
    },
    url: {
        type: String,
        required: true,
    },
    position: {
        type: Number,
        required: true,
        unique: true,
        default: 0,
    },
    redirectURL: {
        type: String,
    },
});
exports.Slider = mongoose_1.default.model('Slider', sliderSchema);
