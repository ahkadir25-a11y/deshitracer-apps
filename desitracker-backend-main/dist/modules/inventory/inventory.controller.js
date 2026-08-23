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
exports.InventoryControllers = void 0;
const http_status_1 = __importDefault(require("http-status"));
const handleAsyncRequest_1 = __importDefault(require("../../utils/handleAsyncRequest"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const inventory_service_1 = require("./inventory.service");
const inventory_model_1 = require("./inventory.model");
const businessAccess_1 = require("../../utils/lib/businessAccess");
const createIngredient = (0, handleAsyncRequest_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield inventory_service_1.InventoryServices.createIngredient(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: 'Ingredient created successfully',
        data: result,
    });
}));
const getIngredientsByBusiness = (0, handleAsyncRequest_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield inventory_service_1.InventoryServices.getIngredientsByBusiness(req.params.businessId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Ingredients retrieved successfully',
        data: result,
    });
}));
const adjustStock = (0, handleAsyncRequest_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { ingredientId, businessId, actionType, amount, notes } = req.body;
    const result = yield inventory_service_1.InventoryServices.adjustStock(ingredientId, businessId, actionType, amount, notes, req.user);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Stock adjusted successfully',
        data: result,
    });
}));
const getStockHistory = (0, handleAsyncRequest_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield inventory_service_1.InventoryServices.getStockHistory(req.params.businessId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Stock history retrieved successfully',
        data: result,
    });
}));
const updateIngredient = (0, handleAsyncRequest_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // The route proves only that the caller holds a business role somewhere.
    // Prove this ingredient is theirs, and stop the body re-homing it.
    yield (0, businessAccess_1.assertOwnsRecord)(req, yield inventory_model_1.Ingredient.findById(req.params.ingredientId).select('business').lean(), 'Ingredient not found');
    delete req.body.business;
    const result = yield inventory_service_1.InventoryServices.updateIngredient(req.params.ingredientId, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Ingredient updated successfully',
        data: result,
    });
}));
const deleteIngredient = (0, handleAsyncRequest_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, businessAccess_1.assertOwnsRecord)(req, yield inventory_model_1.Ingredient.findById(req.params.ingredientId).select('business').lean(), 'Ingredient not found');
    const result = yield inventory_service_1.InventoryServices.deleteIngredient(req.params.ingredientId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Ingredient deleted successfully',
        data: result,
    });
}));
exports.InventoryControllers = {
    createIngredient,
    getIngredientsByBusiness,
    adjustStock,
    getStockHistory,
    updateIngredient,
    deleteIngredient
};
