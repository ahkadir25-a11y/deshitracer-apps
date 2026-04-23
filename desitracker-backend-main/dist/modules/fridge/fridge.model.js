"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const FridgeRecordSchema = new mongoose_1.Schema({
    date: { type: Date, required: true },
    minTemperature: { type: Number, required: true },
    maxTemperature: { type: Number, required: true },
    status: { type: String, enum: ["created", "edited"], default: "created" },
}, { _id: true } // ✅ give each record its own id
);
const FridgeSchema = new mongoose_1.Schema({
    fridgeName: { type: String, required: true },
    fridgeLocation: { type: String, required: true },
    userId: { type: String, required: true, ref: 'User' }, // Reference to user (assuming a User model exists)
    temperatureRecords: [FridgeRecordSchema]
});
const Fridge = (0, mongoose_1.model)('Fridge', FridgeSchema);
exports.default = Fridge;
