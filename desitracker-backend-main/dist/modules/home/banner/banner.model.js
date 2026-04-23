"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Banner = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const bannerSchema = new mongoose_1.default.Schema({
    public_id: {
        type: String,
        required: true,
    },
    url: {
        type: String,
        required: true,
    },
    // position: {
    //   type: Number,
    //   required: true,
    //   default: 0,
    // },
    redirectURL: {
        type: String,
    },
});
exports.Banner = mongoose_1.default.model('Banner', bannerSchema);
