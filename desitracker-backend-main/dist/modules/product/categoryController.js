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
exports.deleteCategory = exports.updateCategory = exports.getCategoryById = exports.getCategories = exports.createCategory = void 0;
const slugify_1 = __importDefault(require("slugify"));
const categoryModel_1 = __importDefault(require("./categoryModel"));
const businessAccess_1 = require("../../utils/lib/businessAccess");
const makeSlug = (text) => (0, slugify_1.default)(text, { lower: true, strict: true, trim: true });
const createCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { name, description, user_id, business_id, foodOrDrink } = req.body;
        const base = makeSlug(name);
        let slug = base;
        let i = 1;
        // ensure uniqueness for this user
        // (unique index also enforces at DB-level)
        while (yield categoryModel_1.default.exists({ user_id, slug })) {
            slug = `${base}-${i++}`;
        }
        const category = yield categoryModel_1.default.create({ name, description, user_id, slug, business_id: business_id, foodOrDrink });
        res.status(201).json(category);
        return;
    }
    catch (err) {
        // Handle rare race where two requests collide and unique index triggers
        if ((err === null || err === void 0 ? void 0 : err.code) === 11000 && ((_a = err === null || err === void 0 ? void 0 : err.keyPattern) === null || _a === void 0 ? void 0 : _a.slug)) {
            res.status(409).json({ message: 'Category slug already exists. Try a different name.' });
            return;
        }
        next(err);
    }
});
exports.createCategory = createCategory;
const getCategories = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const filter = {};
        if (req.query.user_id)
            filter.user_id = String(req.query.user_id);
        if (req.query.business_id)
            filter.business_id = String(req.query.business_id);
        const categories = yield categoryModel_1.default.find(filter).populate('products').sort({ createdAt: -1 });
        res.json(categories);
    }
    catch (err) {
        next(err);
    }
});
exports.getCategories = getCategories;
const getCategoryById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const category = yield categoryModel_1.default.findById(req.params.id).populate('products');
        if (!category) {
            res.status(404).json({ message: 'Category not found' });
            return;
        }
        res.json(category);
    }
    catch (err) {
        next(err);
    }
});
exports.getCategoryById = getCategoryById;
const updateCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Prove the category belongs to a business the caller is part of. The
        // route only checked their role, so any staff member of any business
        // could rename or re-home any category on the platform.
        yield (0, businessAccess_1.assertOwnsRecord)(req, yield categoryModel_1.default.findById(req.params.id).select('business_id').lean(), 'Category not found');
        // The body must not be able to move a category to another business.
        delete req.body.business_id;
        delete req.body.user_id;
        const updated = yield categoryModel_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) {
            res.status(404).json({ message: 'Category not found' });
            return;
        }
        res.json(updated);
        return;
    }
    catch (err) {
        next(err);
    }
});
exports.updateCategory = updateCategory;
// Delete has no body; only params
const deleteCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, businessAccess_1.assertOwnsRecord)(req, yield categoryModel_1.default.findById(req.params.id).select('business_id').lean(), 'Category not found');
        const deleted = yield categoryModel_1.default.findByIdAndDelete(req.params.id);
        if (!deleted) {
            res.status(404).json({ message: 'Category not found' });
            return;
        }
        res.json({ message: 'Category deleted successfully' });
    }
    catch (err) {
        next(err);
    }
});
exports.deleteCategory = deleteCategory;
