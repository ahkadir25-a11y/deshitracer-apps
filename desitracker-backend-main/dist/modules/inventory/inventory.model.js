"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockHistory = exports.Ingredient = void 0;
const mongoose_1 = require("mongoose");
const IngredientSchema = new mongoose_1.Schema({
    business: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: 'Business' },
    name: { type: String, required: true },
    category: { type: String, default: 'Other' },
    unit: { type: String, required: true },
    currentQuantity: { type: Number, required: true, default: 0 },
    minThreshold: { type: Number, required: true, default: 0 },
}, { timestamps: true });
exports.Ingredient = (0, mongoose_1.model)('Ingredient', IngredientSchema);
const StockHistorySchema = new mongoose_1.Schema({
    ingredient: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: 'Ingredient' },
    business: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: 'Business' },
    actionType: { type: String, enum: ['ADD', 'DEDUCT'], required: true },
    amount: { type: Number, required: true },
    user: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: 'User' },
    notes: { type: String },
}, { timestamps: true });
exports.StockHistory = (0, mongoose_1.model)('StockHistory', StockHistorySchema);
