"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductControllers = void 0;
const productService = __importStar(require("./product.service"));
function validateDiscount(discount, res) {
    if (discount === undefined || discount === null)
        return true;
    const n = Number(discount);
    if (Number.isNaN(n) || n < 0 || n > 100) {
        res.status(400).json({ error: 'discount_percent must be a number between 0 and 100.' });
        return false;
    }
    return true;
}
function validateDiscountWindow(startRaw, endRaw, res) {
    // Helper that accepts null/'' and only parses non-empty values
    const parseMaybeDate = (v) => {
        if (v === undefined)
            return { value: null, invalid: false }; // not provided
        if (v === null || v === "")
            return { value: null, invalid: false }; // explicitly unset -> allowed
        const d = new Date(v);
        return isNaN(d.getTime()) ? { value: null, invalid: true } : { value: d, invalid: false };
    };
    const { value: start, invalid: startInvalid } = parseMaybeDate(startRaw);
    const { value: end, invalid: endInvalid } = parseMaybeDate(endRaw);
    if (startInvalid) {
        res.status(400).json({ error: 'discount_start must be a valid date or null.' });
        return { ok: false };
    }
    if (endInvalid) {
        res.status(400).json({ error: 'discount_end must be a valid date or null.' });
        return { ok: false };
    }
    if (start && end && end < start) {
        res.status(400).json({ error: 'discount_end must be greater than or equal to discount_start.' });
        return { ok: false };
    }
    return { ok: true, start, end };
}
// Add a new product
const addProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { name, product_category_id, price, description, tags, images, thumbnail, user_id, business_id, currency, discount_percent, discount_start, discount_end, 
        // ✅ ADD THIS
        product_options_ids, } = req.body;
        if (!validateDiscount(discount_percent, res))
            return;
        const win = validateDiscountWindow(discount_start, discount_end, res);
        if (win.ok === false)
            return;
        const newProduct = yield productService.addProduct({
            name,
            price,
            description,
            tags: Array.isArray(tags) ? tags : [],
            images,
            thumbnail,
            user_id,
            business_id,
            currency,
            product_category_id,
            discount_percent,
            discount_start: (_a = win.start) !== null && _a !== void 0 ? _a : null,
            discount_end: (_b = win.end) !== null && _b !== void 0 ? _b : null,
            // ✅ PASS TO SERVICE
            product_options_ids: Array.isArray(product_options_ids)
                ? product_options_ids
                : [],
        });
        res.status(201).json(newProduct);
    }
    catch (error) {
        console.log("Error adding product:", error);
        res.status(500).json({ error: "Failed to add product" });
    }
});
// Edit
const editProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { productId } = req.params;
        const updateData = req.body;
        // ❌ This used to early-return and do nothing if images is an array.
        // if (updateData.images && Array.isArray(updateData.images)) return;
        if (!validateDiscount(updateData.discount_percent, res))
            return;
        // Validate window only if present in payload
        if ('discount_start' in updateData || 'discount_end' in updateData) {
            const win = validateDiscountWindow(updateData.discount_start, updateData.discount_end, res);
            if (win.ok === false)
                return;
            updateData.discount_start = (_a = win.start) !== null && _a !== void 0 ? _a : null;
            updateData.discount_end = (_b = win.end) !== null && _b !== void 0 ? _b : null;
        }
        const updatedProduct = yield productService.editProduct(productId, updateData);
        if (updatedProduct) {
            res.status(200).json(updatedProduct);
        }
        else {
            res.status(404).json({ error: 'Product not found' });
        }
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to edit product' });
    }
});
// Delete a product
const deleteProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { productId } = req.params;
        const result = yield productService.deleteProduct(productId);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete product' });
    }
});
// Get all products by user and business
const getProductsByUserAndBusiness = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user_id, business_id } = req.params;
        const products = yield productService.getProductsByUserAndBusiness(user_id, business_id);
        res.status(200).json(products);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});
// Get all products by user and business
const getProductsCategoryByUserAndBusiness = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user_id, business_id } = req.params;
        const products = yield productService.getProductsCategoryByUserAndBusiness(user_id, business_id);
        res.status(200).json(products);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});
// Get a product by its ID
const getProductById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const product = yield productService.getProductById(id);
        if (product) {
            res.status(200).json(product);
        }
        else {
            res.status(404).json({ error: 'Product not found' });
        }
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch product details' });
    }
});
const getProductsByCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { categoryId } = req.params; // e.g. /products/category/:categoryId
        const { user_id, business_id } = req.query;
        const products = yield productService.getProductsByCategory(categoryId, user_id, business_id);
        res.status(200).json(products);
    }
    catch (error) {
        console.log('Error fetching products by category:', error);
        res.status(500).json({ error: error });
    }
});
const bulkUpdateDiscount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        const { productIds, filters = {}, discount_percent, discount_start, // NEW optional
        discount_end, // NEW optional
         } = req.body;
        if (!validateDiscount(discount_percent, res))
            return;
        if ((!productIds || productIds.length === 0) &&
            !filters.user_id && !filters.business_id && !filters.product_category_id) {
            res.status(400).json({
                error: 'Provide either productIds[] or at least one filter (user_id, business_id, product_category_id).',
            });
            return;
        }
        // Validate window if provided
        const win = validateDiscountWindow(discount_start, discount_end, res);
        if (win.ok === false)
            return;
        const result = yield productService.bulkUpdateDiscount(Object.assign({ productIds }, filters), discount_percent, { discount_start: (_a = win.start) !== null && _a !== void 0 ? _a : undefined, discount_end: (_b = win.end) !== null && _b !== void 0 ? _b : undefined });
        res.status(200).json({
            message: 'Discount updated in bulk',
            matchedCount: result.matchedCount,
            modifiedCount: result.modifiedCount,
            discount_percent,
            discount_start: (_c = win.start) !== null && _c !== void 0 ? _c : null,
            discount_end: (_d = win.end) !== null && _d !== void 0 ? _d : null,
        });
    }
    catch (error) {
        res.status(500).json({ error: (error === null || error === void 0 ? void 0 : error.message) || 'Failed to bulk update discount' });
    }
});
// ===== Helpers for day offers =====
function validateDayName(day, res) {
    const normalized = productService.normalizeDayName(day);
    if (!normalized) {
        res.status(400).json({ error: 'Invalid day. Use Monday..Sunday (or common abbreviations).' });
        return false;
    }
    return true;
}
function normalizeDayOrFail(day) {
    return productService.normalizeDayName(day);
}
function validatePercent(n, res) {
    if (Number.isFinite(Number(n)) && Number(n) >= 0 && Number(n) <= 100)
        return true;
    res.status(400).json({ error: 'discount_percent must be a number between 0 and 100.' });
    return false;
}
function validateDateRange(startRaw, endRaw, res) {
    var _a;
    const parse = (v) => {
        if (v === undefined)
            return { v: undefined, bad: true };
        if (v === null || v === '')
            return { v: null, bad: false };
        const d = new Date(v);
        return isNaN(d.getTime()) ? { v: undefined, bad: true } : { v: d, bad: false };
    };
    const s = parse(startRaw);
    if (s.bad || !s.v) {
        res.status(400).json({ error: 'start_date is required and must be a valid date.' });
        return { ok: false };
    }
    const e = parse(endRaw);
    if (endRaw !== undefined && e.bad) {
        res.status(400).json({ error: 'end_date must be a valid date or null.' });
        return { ok: false };
    }
    if (e.v && e.v < s.v) {
        res.status(400).json({ error: 'end_date must be greater than or equal to start_date.' });
        return { ok: false };
    }
    return { ok: true, start: s.v, end: ((_a = e.v) !== null && _a !== void 0 ? _a : null) };
}
// ===== Controllers: Day Offers =====
const createDayOffer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user_id, business_id, product_category_id, day, discount_percent, start_date, end_date } = req.body;
        if (!user_id || !business_id) {
            res.status(400).json({ error: 'user_id and business_id are required.' });
            return;
        }
        if (!validateDayName(day, res))
            return;
        if (!validatePercent(discount_percent, res))
            return;
        const range = validateDateRange(start_date, end_date, res);
        if (range.ok === false)
            return;
        const doc = yield productService.createDayOffer({
            user_id,
            business_id,
            product_category_id,
            day: normalizeDayOrFail(day),
            discount_percent: Number(discount_percent),
            start_date: range.start,
            end_date: range.end,
        });
        res.status(201).json(doc);
    }
    catch (err) {
        if ((err === null || err === void 0 ? void 0 : err.code) === 11000) {
            res.status(409).json({ error: 'An offer for this weekday already exists for this business.' });
            return;
        }
        res.status(500).json({ error: (err === null || err === void 0 ? void 0 : err.message) || 'Failed to create day offer' });
    }
});
// List
const listDayOffers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user_id, business_id, city, country } = req.query;
        const items = yield productService.listDayOffers({ user_id, business_id, city, country });
        res.status(200).json(items);
    }
    catch (err) {
        res.status(500).json({ error: (err === null || err === void 0 ? void 0 : err.message) || 'Failed to fetch day offers' });
    }
});
// Get by id
const getDayOffer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const one = yield productService.getDayOfferById(req.params.id);
        if (!one) {
            res.status(404).json({ error: 'Day offer not found' });
            return;
        }
        res.status(200).json(one);
    }
    catch (err) {
        res.status(500).json({ error: (err === null || err === void 0 ? void 0 : err.message) || 'Failed to fetch day offer' });
    }
});
// Update
const updateDayOffer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { day, discount_percent, start_date, end_date } = req.body;
        const updates = {};
        if (day !== undefined) {
            if (!validateDayName(day, res))
                return;
            updates.day = normalizeDayOrFail(day);
        }
        if (discount_percent !== undefined) {
            if (!validatePercent(discount_percent, res))
                return;
            updates.discount_percent = Number(discount_percent);
        }
        if (start_date !== undefined || end_date !== undefined) {
            const range = validateDateRange(start_date !== undefined ? start_date : new Date(), end_date, res);
            if (range.ok === false)
                return;
            updates.start_date = range.start;
            updates.end_date = range.end;
        }
        if (req.body.product_category_id !== undefined) {
            updates.product_category_id = req.body.product_category_id || undefined;
        }
        const updated = yield productService.updateDayOffer(req.params.id, updates);
        if (!updated) {
            res.status(404).json({ error: 'Day offer not found' });
            return;
        }
        res.status(200).json(updated);
    }
    catch (err) {
        if ((err === null || err === void 0 ? void 0 : err.code) === 11000) {
            res.status(409).json({ error: 'Another offer with this weekday already exists for this business.' });
            return;
        }
        res.status(500).json({ error: (err === null || err === void 0 ? void 0 : err.message) || 'Failed to update day offer' });
    }
});
// Delete
const deleteDayOffer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield productService.deleteDayOffer(req.params.id);
        res.status(200).json(result);
    }
    catch (err) {
        res.status(500).json({ error: (err === null || err === void 0 ? void 0 : err.message) || 'Failed to delete day offer' });
    }
});
// Apply today's offer (bulk update products for today only)
const applyDayOfferToday = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user_id, business_id, day } = req.body;
        if (!user_id || !business_id) {
            res.status(400).json({ error: 'user_id and business_id are required.' });
            return;
        }
        let weekday;
        if (day) {
            const n = productService.normalizeDayName(day);
            if (!n) {
                res.status(400).json({ error: 'Invalid day. Use Monday..Sunday (or abbreviations).' });
                return;
            }
            weekday = n;
        }
        else {
            const now = new Date();
            const idx = now.getDay(); // 0..6 (Sun..Sat)
            const names = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            weekday = names[idx];
        }
        const result = yield productService.applyDayOfferToday({ user_id, business_id, day: weekday });
        res.status(200).json(Object.assign({ message: result.applied ? 'Offer applied for today' : 'No active offer for today', day: weekday }, result));
    }
    catch (err) {
        res.status(500).json({ error: (err === null || err === void 0 ? void 0 : err.message) || 'Failed to apply day offer' });
    }
});
// Get most recent active offer for today
const getActiveTodayDayOffer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { business_id, user_id, product_category_id, day } = req.query;
        if (!business_id) {
            res.status(400).json({ error: "business_id is required." });
            return;
        }
        let weekday;
        if (day) {
            const normalized = productService.normalizeDayName(day);
            if (!normalized) {
                res.status(400).json({ error: "Invalid day. Use Monday..Sunday (or abbreviations)." });
                return;
            }
            weekday = normalized;
        }
        else {
            const now = new Date();
            const idx = now.getDay(); // 0..6 Sun..Sat
            const names = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            weekday = names[idx];
        }
        const offer = yield productService.getMostRecentActiveOfferForToday({
            business_id,
            user_id,
            product_category_id,
            day: weekday,
        });
        if (!offer) {
            res.status(200).json({ active: false, day: weekday, offer: null });
            return;
        }
        res.status(200).json({ active: true, day: weekday, offer });
    }
    catch (err) {
        res.status(500).json({ error: (err === null || err === void 0 ? void 0 : err.message) || "Failed to fetch active offer for today" });
    }
});
exports.ProductControllers = {
    addProduct,
    editProduct,
    deleteProduct,
    getProductsByUserAndBusiness,
    getProductsCategoryByUserAndBusiness,
    getProductById,
    getProductsByCategory,
    bulkUpdateDiscount,
    createDayOffer,
    listDayOffers,
    getDayOffer,
    updateDayOffer,
    deleteDayOffer,
    applyDayOfferToday,
    getActiveTodayDayOffer
};
