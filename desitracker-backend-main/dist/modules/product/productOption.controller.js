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
exports.deleteProductOption = exports.updateProductOption = exports.getSingleProductOption = exports.getProductOptions = exports.createProductOption = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const productOption_model_1 = __importDefault(require("./productOption.model"));
const getUserIdFromRequest = (req) => {
    var _a, _b, _c, _d, _e;
    return (((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) ||
        ((_b = req.user) === null || _b === void 0 ? void 0 : _b._id) ||
        ((_c = req.body) === null || _c === void 0 ? void 0 : _c.userId) ||
        ((_d = req.query) === null || _d === void 0 ? void 0 : _d.userId) ||
        ((_e = req.params) === null || _e === void 0 ? void 0 : _e.userId) ||
        null);
};
// Create a new product option
const createProductOption = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, options } = req.body;
        const userId = getUserIdFromRequest(req);
        if (!userId) {
            res.status(400).json({ error: "userId is required" });
            return;
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
            res.status(400).json({ error: "Invalid userId" });
            return;
        }
        if (!name || typeof name !== "string") {
            res.status(400).json({ error: "name is required" });
            return;
        }
        if (!Array.isArray(options) || options.length === 0) {
            res.status(400).json({ error: "options must be a non-empty array" });
            return;
        }
        const cleanedOptions = options
            .map((opt) => String(opt).trim())
            .filter(Boolean);
        if (cleanedOptions.length === 0) {
            res.status(400).json({ error: "options must contain valid values" });
            return;
        }
        const newOption = new productOption_model_1.default({
            name: name.trim(),
            options: cleanedOptions,
            userId,
        });
        yield newOption.save();
        res.status(201).json(newOption);
    }
    catch (error) {
        console.error("Error creating product option:", error);
        res.status(500).json({ error: "Failed to create product option" });
    }
});
exports.createProductOption = createProductOption;
// Get ALL product options by user
const getProductOptions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = getUserIdFromRequest(req);
        if (!userId) {
            res.status(400).json({ error: "userId is required" });
            return;
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
            res.status(400).json({ error: "Invalid userId" });
            return;
        }
        const options = yield productOption_model_1.default.find({ userId }).sort({ createdAt: -1 });
        res.status(200).json(options);
    }
    catch (error) {
        console.error("Error fetching product options:", error);
        res.status(500).json({ error: "Failed to fetch product options" });
    }
});
exports.getProductOptions = getProductOptions;
// Get single option by id + userId
const getSingleProductOption = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { optionId } = req.params;
        const userId = getUserIdFromRequest(req);
        if (!userId) {
            res.status(400).json({ error: "userId is required" });
            return;
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
            res.status(400).json({ error: "Invalid userId" });
            return;
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(optionId)) {
            res.status(400).json({ error: "Invalid optionId" });
            return;
        }
        const option = yield productOption_model_1.default.findOne({ _id: optionId, userId });
        if (!option) {
            res.status(404).json({ error: "Option not found" });
            return;
        }
        res.status(200).json(option);
    }
    catch (error) {
        console.error("Error fetching product option:", error);
        res.status(500).json({ error: "Failed to fetch product option" });
    }
});
exports.getSingleProductOption = getSingleProductOption;
// Update by id + userId
const updateProductOption = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { optionId } = req.params;
        const userId = getUserIdFromRequest(req);
        if (!userId) {
            res.status(400).json({ error: "userId is required" });
            return;
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
            res.status(400).json({ error: "Invalid userId" });
            return;
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(optionId)) {
            res.status(400).json({ error: "Invalid optionId" });
            return;
        }
        const updateData = {};
        if (req.body.name !== undefined) {
            if (!req.body.name || typeof req.body.name !== "string") {
                res.status(400).json({ error: "name must be a valid string" });
                return;
            }
            updateData.name = req.body.name.trim();
        }
        if (req.body.options !== undefined) {
            if (!Array.isArray(req.body.options) || req.body.options.length === 0) {
                res.status(400).json({ error: "options must be a non-empty array" });
                return;
            }
            const cleanedOptions = req.body.options
                .map((opt) => String(opt).trim())
                .filter(Boolean);
            if (cleanedOptions.length === 0) {
                res.status(400).json({ error: "options must contain valid values" });
                return;
            }
            updateData.options = cleanedOptions;
        }
        // never allow changing ownership from update payload
        delete updateData.userId;
        const updatedOption = yield productOption_model_1.default.findOneAndUpdate({ _id: optionId, userId }, updateData, { new: true, runValidators: true });
        if (!updatedOption) {
            res.status(404).json({ error: "Option not found" });
            return;
        }
        res.status(200).json(updatedOption);
    }
    catch (error) {
        console.error("Error updating product option:", error);
        res.status(500).json({ error: "Failed to update product option" });
    }
});
exports.updateProductOption = updateProductOption;
// Delete by id + userId
const deleteProductOption = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { optionId } = req.params;
        const userId = getUserIdFromRequest(req);
        if (!userId) {
            res.status(400).json({ error: "userId is required" });
            return;
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
            res.status(400).json({ error: "Invalid userId" });
            return;
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(optionId)) {
            res.status(400).json({ error: "Invalid optionId" });
            return;
        }
        const deletedOption = yield productOption_model_1.default.findOneAndDelete({
            _id: optionId,
            userId,
        });
        if (!deletedOption) {
            res.status(404).json({ error: "Option not found" });
            return;
        }
        res.status(200).json({ message: "Option deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting product option:", error);
        res.status(500).json({ error: "Failed to delete product option" });
    }
});
exports.deleteProductOption = deleteProductOption;
