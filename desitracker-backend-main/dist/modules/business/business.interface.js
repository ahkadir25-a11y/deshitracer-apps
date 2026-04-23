"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpeningHourSchema = void 0;
const mongoose_1 = require("mongoose");
exports.OpeningHourSchema = new mongoose_1.Schema({
    day: { type: String, required: true },
    start: { type: String },
    end: { type: String },
});
