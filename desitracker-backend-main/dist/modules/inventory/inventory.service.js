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
exports.InventoryServices = void 0;
const AppError_1 = __importDefault(require("../../errors/AppError"));
const inventory_model_1 = require("./inventory.model");
const notification_service_1 = require("../notification/notification.service");
const socket_1 = require("../../utils/socket");
const createIngredient = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield inventory_model_1.Ingredient.create(payload);
    (0, socket_1.emitToBusiness)(payload.business, 'inventory_updated', result);
    return result;
});
const getIngredientsByBusiness = (businessId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield inventory_model_1.Ingredient.find({ business: businessId });
    return result;
});
const adjustStock = (ingredientId, businessId, actionType, amount, notes, decodedUser) => __awaiter(void 0, void 0, void 0, function* () {
    // Reject non-positive / non-finite amounts — a negative DEDUCT would otherwise
    // INCREASE stock and corrupt the ledger.
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) {
        throw new AppError_1.default(400, 'Amount must be a positive number');
    }
    // Scope the lookup to the caller's business — never mutate another tenant's
    // ingredient by id (authenticated IDOR).
    const ingredient = yield inventory_model_1.Ingredient.findOne({ _id: ingredientId, business: businessId });
    if (!ingredient) {
        throw new AppError_1.default(404, 'Ingredient not found');
    }
    const prevQuantity = ingredient.currentQuantity;
    let updatedIngredient;
    if (actionType === 'ADD') {
        // Atomic increment — no read-modify-write race.
        updatedIngredient = yield inventory_model_1.Ingredient.findOneAndUpdate({ _id: ingredientId, business: businessId }, { $inc: { currentQuantity: amt } }, { new: true });
    }
    else {
        // Atomic conditional decrement: only succeeds if enough stock remains,
        // which prevents concurrent deductions from overselling.
        updatedIngredient = yield inventory_model_1.Ingredient.findOneAndUpdate({ _id: ingredientId, business: businessId, currentQuantity: { $gte: amt } }, { $inc: { currentQuantity: -amt } }, { new: true });
        if (!updatedIngredient) {
            throw new AppError_1.default(400, `You only have ${prevQuantity} ${ingredient.unit} in stock. You cannot deduct ${amt} ${ingredient.unit}.`);
        }
    }
    const newQuantity = updatedIngredient.currentQuantity;
    const wasLowStock = prevQuantity <= ingredient.minThreshold;
    const isLowStockNow = newQuantity <= ingredient.minThreshold;
    if (!wasLowStock && isLowStockNow) {
        yield notification_service_1.NotificationServices.createNotification({
            business: businessId,
            title: 'Low Stock Alert',
            message: `${ingredient.name} dropped to ${newQuantity.toFixed(2)} ${ingredient.unit} (Min: ${ingredient.minThreshold}).`,
            type: 'LOW_STOCK'
        });
    }
    yield inventory_model_1.StockHistory.create({
        ingredient: ingredientId,
        business: businessId,
        actionType,
        amount: amt,
        user: decodedUser.id,
        notes
    });
    (0, socket_1.emitToBusiness)(businessId, 'inventory_updated', updatedIngredient);
    return updatedIngredient;
});
const getStockHistory = (businessId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield inventory_model_1.StockHistory.find({ business: businessId })
        .populate('ingredient', 'name unit')
        .populate('user', 'name')
        .sort({ createdAt: -1 });
    return result;
});
const updateIngredient = (ingredientId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield inventory_model_1.Ingredient.findByIdAndUpdate(ingredientId, payload, { new: true });
    if (!result) {
        throw new AppError_1.default(404, 'Ingredient not found');
    }
    return result;
});
const deleteIngredient = (ingredientId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield inventory_model_1.Ingredient.findByIdAndDelete(ingredientId);
    if (!result) {
        throw new AppError_1.default(404, 'Ingredient not found');
    }
    // Optional: delete associated StockHistory if needed
    yield inventory_model_1.StockHistory.deleteMany({ ingredient: ingredientId });
    return result;
});
exports.InventoryServices = {
    createIngredient,
    getIngredientsByBusiness,
    adjustStock,
    getStockHistory,
    updateIngredient,
    deleteIngredient
};
