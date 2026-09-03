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
exports.getMostRecentActiveOfferForToday = exports.bulkUpdateDiscount = exports.getProductById = exports.getProductsByCategory = exports.getProductsCategoryByUserAndBusiness = exports.getProductsByUserAndBusiness = exports.deleteProduct = exports.editProduct = exports.addProduct = void 0;
exports.normalizeDayName = normalizeDayName;
exports.countDayOffersForBusiness = countDayOffersForBusiness;
exports.createDayOffer = createDayOffer;
exports.listDayOffers = listDayOffers;
exports.getDayOfferById = getDayOfferById;
exports.updateDayOffer = updateDayOffer;
exports.deleteDayOffer = deleteDayOffer;
exports.findActiveOfferForDate = findActiveOfferForDate;
exports.applyDayOfferToday = applyDayOfferToday;
const business_model_1 = require("../business/business.model");
const categoryModel_1 = __importDefault(require("./categoryModel"));
const dayOffer_model_1 = __importDefault(require("./dayOffer.model"));
const product_model_1 = __importDefault(require("./product.model"));
const member_model_1 = require("../members/member.model");
const push_1 = require("../../utils/lib/push");
// Add a new product
const addProduct = (_a) => __awaiter(void 0, [_a], void 0, function* ({ name, price, description, tags = [], images, thumbnail, user_id, business_id, currency, product_category_id, discount_percent = 0, discount_start = null, discount_end = null, 
// ✅ ADD THIS
product_options_ids = [], }) {
    const newProduct = new product_model_1.default({
        name,
        price,
        description,
        tags,
        images,
        thumbnail,
        user_id,
        business_id,
        currency,
        product_category_id,
        discount_percent,
        discount_start,
        discount_end,
        // ✅ SAVE IN DB
        product_options_ids,
    });
    yield newProduct.save();
    return newProduct;
});
exports.addProduct = addProduct;
// Edit an existing product
const editProduct = (productId, updateData) => __awaiter(void 0, void 0, void 0, function* () {
    const updatedProduct = yield product_model_1.default.findByIdAndUpdate(productId, updateData, { new: true });
    return updatedProduct;
});
exports.editProduct = editProduct;
// Delete a product
const deleteProduct = (productId) => __awaiter(void 0, void 0, void 0, function* () {
    yield product_model_1.default.findByIdAndDelete(productId);
    return { message: 'Product deleted successfully' };
});
exports.deleteProduct = deleteProduct;
// Get all products by user and business
const getProductsByUserAndBusiness = (user_id, business_id) => __awaiter(void 0, void 0, void 0, function* () {
    // product_options_ids must be populated here, not just on the per-category
    // route. Without it every dish looks like it has no choices at all, so the
    // apps were forced to fan out one request per category just to see options
    // — N requests on every menu load, growing with the category count.
    // The option-group document is tiny ({ name, options[] }), so this costs
    // very little and lets a caller load a whole menu in a single request.
    const products = yield product_model_1.default.find({ user_id, business_id })
        .populate('product_options_ids')
        .sort({ createdAt: -1 });
    return products;
});
exports.getProductsByUserAndBusiness = getProductsByUserAndBusiness;
// Get all products by user and business
const getProductsCategoryByUserAndBusiness = (user_id, business_id) => __awaiter(void 0, void 0, void 0, function* () {
    const categories = yield categoryModel_1.default.find({ user_id, business_id }).sort({ createdAt: -1 });
    return categories;
});
exports.getProductsCategoryByUserAndBusiness = getProductsCategoryByUserAndBusiness;
const getProductsByCategory = (product_category_id, user_id, business_id) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Fetching products by category:", product_category_id, user_id, business_id);
    // Build a flexible MongoDB filter object
    const filter = { product_category_id };
    if (user_id)
        filter.user_id = user_id;
    if (business_id)
        filter.business_id = business_id;
    // Fetch and (optionally) populate related refs
    const products = yield product_model_1.default.find(filter)
        .populate('user_id') // comment-out if you don’t need these
        .populate('business_id') // to keep responses smaller
        .populate('product_category_id')
        .populate('product_options_ids')
        .sort({ createdAt: -1 });
    return products;
});
exports.getProductsByCategory = getProductsByCategory;
// product.service.ts
// Get a product by its ID and populate the user and business
const getProductById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    // Populate user and business data
    const product = yield product_model_1.default.findById(id)
        .populate('user_id') // Populating user with specific fields
        .populate('business_id') // Populating business with specific fields
        .populate('product_options_ids'); // Populating business with specific fields
    return product;
});
exports.getProductById = getProductById;
const bulkUpdateDiscount = (params, discount_percent, window // NEW
) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    const filter = {};
    if ((_a = params.productIds) === null || _a === void 0 ? void 0 : _a.length)
        filter._id = { $in: params.productIds };
    if (params.user_id)
        filter.user_id = params.user_id;
    if (params.business_id)
        filter.business_id = params.business_id;
    if (params.product_category_id)
        filter.product_category_id = params.product_category_id;
    const $set = { discount_percent };
    if (window) {
        if ('discount_start' in window)
            $set.discount_start = (_b = window.discount_start) !== null && _b !== void 0 ? _b : null;
        if ('discount_end' in window)
            $set.discount_end = (_c = window.discount_end) !== null && _c !== void 0 ? _c : null;
    }
    const result = yield product_model_1.default.updateMany(filter, { $set });
    return { matchedCount: (_d = result.matchedCount) !== null && _d !== void 0 ? _d : 0, modifiedCount: (_e = result.modifiedCount) !== null && _e !== void 0 ? _e : 0 };
});
exports.bulkUpdateDiscount = bulkUpdateDiscount;
// Normalize common day name inputs to Weekday
function normalizeDayName(input) {
    var _a;
    if (!input)
        return null;
    const map = {
        mon: 'Monday', monday: 'Monday',
        tue: 'Tuesday', tues: 'Tuesday', tuesday: 'Tuesday',
        wed: 'Wednesday', weds: 'Wednesday', wednesday: 'Wednesday',
        thu: 'Thursday', thur: 'Thursday', thurs: 'Thursday', thursday: 'Thursday',
        fri: 'Friday', friday: 'Friday',
        sat: 'Saturday', saturday: 'Saturday',
        sun: 'Sunday', sunday: 'Sunday',
    };
    return (_a = map[String(input).trim().toLowerCase()]) !== null && _a !== void 0 ? _a : null;
}
function countDayOffersForBusiness(business_id) {
    return __awaiter(this, void 0, void 0, function* () {
        return dayOffer_model_1.default.countDocuments({ business_id });
    });
}
function createDayOffer(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const total = yield countDayOffersForBusiness(data.business_id);
        if (total >= 7)
            throw new Error('You already have 7 day offers for this business.');
        const doc = new dayOffer_model_1.default(data);
        const saved = yield doc.save();
        // notify all active members with a push token (fire-and-forget)
        notifyMembersNewOffer(data.business_id, data.discount_percent, data.day).catch(() => { });
        return saved;
    });
}
function notifyMembersNewOffer(businessId, discountPercent, day) {
    return __awaiter(this, void 0, void 0, function* () {
        const business = yield business_model_1.Business.findById(businessId).select('businessName').lean();
        const name = (business === null || business === void 0 ? void 0 : business.businessName) || 'A business';
        // Respect the member's newOffers preference. `$ne: false` rather than
        // `true` so members created before this field existed still get offers.
        const members = yield member_model_1.Member.find({
            active: true,
            expoPushToken: { $ne: null },
            deletedAt: null,
            'notificationPrefs.newOffers': { $ne: false },
        })
            .select('expoPushToken')
            .lean();
        const tokens = members.map((m) => m.expoPushToken).filter(Boolean);
        if (!tokens.length)
            return;
        // send in batches of 100 (Expo limit)
        for (let i = 0; i < tokens.length; i += 100) {
            const batch = tokens.slice(i, i + 100).map((to) => ({
                to,
                title: '🎉 New Member Offer!',
                body: `${name} is offering ${discountPercent}% off every ${day}. Show your member card!`,
                data: { type: 'NEW_OFFER', businessId },
                channelId: 'member-offers',
            }));
            yield (0, push_1.sendExpoPush)(batch);
        }
    });
}
function listDayOffers(filters) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const q = {};
        if (filters.user_id)
            q.user_id = filters.user_id;
        if (filters.business_id)
            q.business_id = filters.business_id;
        const hasCity = Boolean((_a = filters.city) === null || _a === void 0 ? void 0 : _a.trim());
        const hasCountry = Boolean((_b = filters.country) === null || _b === void 0 ? void 0 : _b.trim());
        if (hasCity || hasCountry) {
            const andClauses = [];
            if (hasCity) {
                // city matches city/division/district/thana/homeTown/address and branches.city (contains, case-insensitive)
                const cityRx = new RegExp(escapeRegex(filters.city.trim()), 'i');
                const cityOr = [
                    { 'locations.city': { $regex: cityRx } },
                    { 'locations.division': { $regex: cityRx } },
                    { 'locations.district': { $regex: cityRx } },
                    { 'locations.thana': { $regex: cityRx } },
                    { 'locations.homeTown': { $regex: cityRx } },
                    { 'locations.address': { $regex: cityRx } },
                    { 'locations.branches': { $elemMatch: { city: { $regex: cityRx } } } },
                ];
                andClauses.push({ $or: cityOr });
            }
            if (hasCountry) {
                // country matches country and branch.country (exact, case-insensitive).
                // Change to `new RegExp(escapeRegex(filters.country!.trim()), 'i')` if you want contains.
                const countryRx = new RegExp(`^${escapeRegex(filters.country.trim())}$`, 'i');
                const countryOr = [
                    { 'locations.country': { $regex: countryRx } },
                    { 'locations.branches': { $elemMatch: { country: { $regex: countryRx } } } },
                ];
                andClauses.push({ $or: countryOr });
            }
            const bizMatch = andClauses.length ? { $and: andClauses } : {};
            // Find businesses that satisfy the location filters
            const businesses = yield business_model_1.Business.find(bizMatch).select('_id').lean();
            const ids = businesses.map((b) => b._id);
            // If specific business_id is provided, ensure it survives the location filter
            if (filters.business_id) {
                const matches = ids.some((id) => String(id) === String(filters.business_id));
                if (!matches)
                    return []; // location filters exclude this business
                q.business_id = filters.business_id;
            }
            else {
                if (!ids.length)
                    return []; // no businesses match location criteria
                q.business_id = { $in: ids };
            }
        }
        return dayOffer_model_1.default.find(q)
            .sort({ day: 1, createdAt: -1 })
            .populate('business_id');
    });
}
function escapeRegex(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
function getDayOfferById(id) {
    return __awaiter(this, void 0, void 0, function* () {
        return dayOffer_model_1.default.findById(id);
    });
}
function updateDayOffer(id, updates) {
    return __awaiter(this, void 0, void 0, function* () {
        return dayOffer_model_1.default.findByIdAndUpdate(id, updates, { new: true });
    });
}
function deleteDayOffer(id) {
    return __awaiter(this, void 0, void 0, function* () {
        yield dayOffer_model_1.default.findByIdAndDelete(id);
        return { message: 'Day offer deleted successfully' };
    });
}
/** Find an active offer on a given date for a weekday & business. */
function findActiveOfferForDate(params) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const on = (_a = params.onDate) !== null && _a !== void 0 ? _a : new Date();
        const startOfDay = new Date(on.getFullYear(), on.getMonth(), on.getDate());
        const endOfDay = new Date(on.getFullYear(), on.getMonth(), on.getDate(), 23, 59, 59, 999);
        return dayOffer_model_1.default.findOne({
            business_id: params.business_id,
            day: params.day,
            start_date: { $lte: endOfDay },
            $or: [{ end_date: null }, { end_date: { $gte: startOfDay } }],
        });
    });
}
/**
 * Apply the business's active offer for a weekday *for today only* by
 * bulk-updating product discounts and setting discount_start/end to today.
 * Optionally scopes to product_category_id if present on the offer.
 */
function applyDayOfferToday(params) {
    return __awaiter(this, void 0, void 0, function* () {
        const today = new Date();
        const start = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
        const end = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
        const offer = yield findActiveOfferForDate({
            business_id: params.business_id,
            day: params.day,
            onDate: today,
        });
        if (!offer) {
            return { applied: false, matchedCount: 0, modifiedCount: 0 };
        }
        const filters = {
            user_id: params.user_id,
            business_id: params.business_id,
        };
        if (offer.product_category_id) {
            filters.product_category_id = String(offer.product_category_id);
        }
        const res = yield (0, exports.bulkUpdateDiscount)(filters, offer.discount_percent, { discount_start: start, discount_end: end });
        return {
            applied: true,
            discount_percent: offer.discount_percent,
            matchedCount: res.matchedCount,
            modifiedCount: res.modifiedCount,
        };
    });
}
const getMostRecentActiveOfferForToday = (_a) => __awaiter(void 0, [_a], void 0, function* ({ business_id, user_id, product_category_id, day, }) {
    const now = new Date();
    const query = {
        business_id,
        day,
        start_date: { $lte: now },
        $or: [{ end_date: null }, { end_date: { $gte: now } }],
    };
    if (user_id)
        query.user_id = user_id;
    if (product_category_id)
        query.product_category_id = product_category_id;
    // "Most recent" = last updated, then created
    const offer = yield dayOffer_model_1.default.findOne(query).sort({ updatedAt: -1, createdAt: -1 });
    return offer;
});
exports.getMostRecentActiveOfferForToday = getMostRecentActiveOfferForToday;
