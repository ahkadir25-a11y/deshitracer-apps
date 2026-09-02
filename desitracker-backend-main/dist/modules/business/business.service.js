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
exports.BusinessServices = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const mongoose_1 = require("mongoose");
const config_1 = __importDefault(require("../../config"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const sendEmail_1 = __importDefault(require("../../utils/lib/sendEmail"));
const slug_1 = require("../../utils/lib/slug");
const queryBuilder_1 = __importDefault(require("../../utils/queryBuilder"));
const visitorCount_service_1 = require("../analytics/businessVisitorCount/visitorCount.service");
const auth_constants_1 = require("../user/auth/auth.constants");
const user_model_1 = require("../user/user/user.model");
const business_model_1 = require("./business.model");
const business_template_1 = require("./business.template");
const cascadeCleanup_1 = require("../../utils/lib/cascadeCleanup");
// Fill the country-neutral location fields from whatever the country actually
// sent, and turn a coordinate pair into the GeoJSON point the database can
// index. Runs on create and on update, and only ever ADDS: every named field
// the caller sent is left exactly as it arrived.
//
// Nothing here invents data. A missing or out-of-range coordinate leaves `geo`
// alone rather than storing a point in the Gulf of Guinea, which is where
// (0, 0) puts a business that never gave one.
const normaliseLocation = (payload) => {
    const loc = payload === null || payload === void 0 ? void 0 : payload.locations;
    if (!loc || typeof loc !== 'object')
        return payload;
    // The region tier under its local names: division in Bangladesh, a county in
    // the UK, a state in Brazil. Whichever arrived becomes `region` too.
    if (!loc.region) {
        const region = loc.region || loc.division || loc.state;
        if (region)
            loc.region = region;
    }
    // Coordinates arrive as strings from the form.
    const lat = Number(loc.lat);
    const lng = Number(loc.long);
    const usable = Number.isFinite(lat) &&
        Number.isFinite(lng) &&
        Math.abs(lat) <= 90 &&
        Math.abs(lng) <= 180 &&
        !(lat === 0 && lng === 0);
    if (usable && !loc.geo) {
        // GeoJSON is [longitude, latitude] — the reverse of how it is spoken.
        loc.geo = { type: 'Point', coordinates: [lng, lat] };
        if (!loc.geoSource)
            loc.geoSource = 'device';
    }
    return payload;
};
const registerBusiness = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    normaliseLocation(payload);
    if (!(payload === null || payload === void 0 ? void 0 : payload.businessName)) {
        throw new AppError_1.default(400, 'Business name is required');
    }
    if (!(payload === null || payload === void 0 ? void 0 : payload.owner)) {
        throw new AppError_1.default(400, 'Business Owner is required');
    }
    const isOwner = yield user_model_1.User.findById(payload === null || payload === void 0 ? void 0 : payload.owner);
    if (!isOwner) {
        throw new AppError_1.default(404, 'Business Owner is not found.');
    }
    // One owner, one business. The app assumes this everywhere — the dashboard
    // loads the owner's FIRST business and has no way to switch, so a second one
    // is invisible while its staff, orders and takings quietly belong to a
    // business the owner cannot see.
    const existing = yield business_model_1.Business.findOne({
        owner: payload.owner,
        isDeleted: false,
    }).select('_id businessName');
    if (existing) {
        throw new AppError_1.default(409, `This account already has a business (${existing.businessName}). Each account can register one business.`);
    }
    const slug = (0, slug_1.stringToSlug)(payload.businessName);
    const result = yield business_model_1.Business.create(Object.assign(Object.assign({}, payload), { slug, isActive: true }));
    if (!result) {
        throw new AppError_1.default(500, 'failed to create Business');
    }
    (0, sendEmail_1.default)({
        email: isOwner === null || isOwner === void 0 ? void 0 : isOwner.email,
        subject: `Business Listing Approved – Desi Tracker`,
        message: (0, business_template_1.getBusinessApprovedTemplate)(`Business Listing Approved – Desi Tracker`, result === null || result === void 0 ? void 0 : result.businessName),
    }).catch(emailError => {
        console.error('Failed to send email to owner:', emailError);
    });
    (0, sendEmail_1.default)({
        email: config_1.default.adminEmail,
        subject: `Let's Welcome a new business: ${result.businessName} `,
        message: `${result === null || result === void 0 ? void 0 : result.businessName} is registered to your application. Owner name is: ${isOwner === null || isOwner === void 0 ? void 0 : isOwner.name}`,
    }).catch(emailError => {
        console.error('Failed to send email to admin:', emailError);
    });
    return result;
});
const updateBusiness = (slug, payload, decodedUser) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    normaliseLocation(payload);
    const business = yield business_model_1.Business.findOne({ slug });
    if (!business) {
        throw new AppError_1.default(404, `Business with slug ${slug} is not found`);
    }
    // Authorize on ownership of THIS business (or admin). The previous check only
    // ran for role 'user', but the route only admits ADMIN/BUSINESS_OWNER, so it
    // was dead code — any owner could edit any other owner's business by slug.
    const isAdmin = (decodedUser === null || decodedUser === void 0 ? void 0 : decodedUser.role) === auth_constants_1.USER_ROLE.ADMIN;
    const isOwnerOfThis = ((_a = decodedUser === null || decodedUser === void 0 ? void 0 : decodedUser.id) === null || _a === void 0 ? void 0 : _a.toString()) === ((_b = business === null || business === void 0 ? void 0 : business.owner) === null || _b === void 0 ? void 0 : _b.toString());
    if (!isAdmin && !isOwnerOfThis) {
        throw new AppError_1.default(403, `You are not authorized to modify business with slug ${slug}.`);
    }
    // Only an admin may reassign ownership. A non-admin owner editing their own
    // business cannot hand it (or seize someone else's) by setting a new `owner`.
    if (!isAdmin && (payload === null || payload === void 0 ? void 0 : payload.owner) && payload.owner.toString() !== business.owner.toString()) {
        throw new AppError_1.default(403, 'Only an admin can change the business owner.');
    }
    if (!(payload === null || payload === void 0 ? void 0 : payload.owner)) {
        throw new AppError_1.default(400, 'Business Owner is required');
    }
    const isOwner = yield user_model_1.User.findById(payload === null || payload === void 0 ? void 0 : payload.owner);
    if (!isOwner) {
        throw new AppError_1.default(404, 'Business Owner is not found.');
    }
    let newSlug;
    if (payload === null || payload === void 0 ? void 0 : payload.businessName) {
        newSlug = (0, slug_1.stringToSlug)(payload.businessName);
    }
    console.log(payload === null || payload === void 0 ? void 0 : payload.media);
    const result = yield business_model_1.Business.findOneAndUpdate({ slug }, Object.assign(Object.assign({}, payload), { slug: newSlug ? newSlug : business.slug }), {
        new: true,
        runValidators: true,
    });
    if (!result) {
        throw new AppError_1.default(404, `Business with slug ${slug} is not found`);
    }
    // if (payload?.isActive) {
    //   await sendEmail({
    //     email: isOwner?.email,
    //     subject: `Business Listing Approved – Desi Tracker`,
    //     message: getBusinessApprovedTemplate(
    //       `Business Listing Approved – Desi Tracker`,
    //       result?.businessName,
    //     ),
    //   });
    // }
    return result;
});
// const getAllBusiness = async (query: Record<string, unknown>) => {
//   const newQuery: Record<string, unknown> = {};
//   // Basic fields
//   if (query?.searchTerm) newQuery.searchTerm = query.searchTerm;
//   if (query?.businessName) newQuery.businessName = query.businessName;
//   if (query?.owner) newQuery.owner = new Types.ObjectId(query.owner as string);
//   if (query?.slug) newQuery.slug = query.slug;
//   if (query?.category)
//     newQuery.category = new Types.ObjectId(query.category as string);
//   if (query?.subCategory)
//     newQuery.subCategory = new Types.ObjectId(query.subCategory as string);
//   if (query?.established) newQuery.established = query.established;
//   if (query?.isDeleted !== undefined) newQuery.isDeleted = query.isDeleted;
//   if (query?.isActive !== undefined) {
//     newQuery.isActive = query.isActive === 'true'; // Correctly convert 'true' string to boolean true
//   }
//   if (query?.isHalal !== undefined) newQuery.isHalal = query.isHalal;
//   if (query?.howToHearAboutDesiTracker)
//     newQuery.howToHearAboutDesiTracker = query.howToHearAboutDesiTracker;
//   // Features filtering
//   if (query?.acceptedPaymentMethod)
//     newQuery['features.acceptedPaymentMethod'] = query.acceptedPaymentMethod;
//   if (query?.officialLanguage)
//     newQuery['features.officialLanguage'] = query.officialLanguage;
//   if (query?.secondLanguage)
//     newQuery['features.secondLanguage'] = query.secondLanguage;
//   if (query?.foodOptions)
//     newQuery['features.foodOptions'] = query.foodOptions;
//   if (query?.offerSpecialDiscount !== undefined)
//     newQuery['features.offerSpecialDiscount'] = query.offerSpecialDiscount;
//   if (query?.isWheelChairAccessible !== undefined)
//     newQuery['features.isWheelChairAccessible'] = query.isWheelChairAccessible;
//   // Contact details
//   if (query?.phoneNumber)
//     newQuery['contactDetails.phoneNumber'] = query.phoneNumber;
//   if (query?.email) newQuery['contactDetails.email'] = query.email;
//   // Operation details
//   if (query?.provideHomeDelivery !== undefined)
//     newQuery['operationDetails.provideHomeDelivery'] =
//       query.provideHomeDelivery;
//   if (query?.provideOnlineService !== undefined)
//     newQuery['operationDetails.provideOnlineService'] =
//       query.provideOnlineService;
//   if (query?.offerInStorePickup !== undefined)
//     newQuery['operationDetails.offerInStorePickup'] =
//       query.offerInStorePickup;
//   if (query?.isParkingAvailable !== undefined)
//     newQuery['operationDetails.isParkingAvailable'] =
//       query.isParkingAvailable;
//   if (query?.offerOnlineBooking !== undefined)
//     newQuery['operationDetails.offerOnlineBooking'] =
//       query.offerOnlineBooking;
//   if (query?.onlineBookingLink)
//     newQuery['operationDetails.onlineBookingLink'] =
//       query.onlineBookingLink;
//   // Location
//   if (query?.city) newQuery['locations.city'] = query.city;
//   if (query?.state) newQuery['locations.state'] = query.state;
//   if (query?.country) newQuery['locations.country'] = query.country;
//   // Pagination
//   if (query?.page) newQuery.page = parseInt(query.page as string);
//   if (query?.limit) newQuery.limit = parseInt(query.limit as string);
//   console.log(newQuery)
//   const businessQuery = new QueryBuilder<TBusiness>(
//     Business.find({ isDeleted: false }).populate([
//       { path: 'owner', model: 'User' },
//       { path: 'category', model: 'Category' },
//       { path: 'subCategory', model: 'Subcategory' },
//     ]),
//     newQuery
//   )
//     .search([
//       'businessName',
//       'contactDetails.email',
//       'locations.address',
//       'location.exactBusinessLocation',
//       'description',
//     ])
//     .filter()
//     .sort()
//     .paginate()
//     .fieldsLimit();
//   const result = await businessQuery.modelQuery;
//   const meta = await businessQuery.countTotal();
//   return {
//     meta,
//     result,
//   };
// };
const getAllBusiness = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const newQuery = {};
    // Basic fields
    if (query === null || query === void 0 ? void 0 : query.searchTerm)
        newQuery.searchTerm = query.searchTerm;
    if (query === null || query === void 0 ? void 0 : query.businessName)
        newQuery.businessName = query.businessName;
    if (query === null || query === void 0 ? void 0 : query.owner)
        newQuery.owner = new mongoose_1.Types.ObjectId(query.owner);
    if (query === null || query === void 0 ? void 0 : query.slug)
        newQuery.slug = query.slug;
    if (query === null || query === void 0 ? void 0 : query.category)
        newQuery.category = new mongoose_1.Types.ObjectId(query.category);
    if (query === null || query === void 0 ? void 0 : query.subCategory)
        newQuery.subCategory = new mongoose_1.Types.ObjectId(query.subCategory);
    if (query === null || query === void 0 ? void 0 : query.established)
        newQuery.established = query.established;
    if ((query === null || query === void 0 ? void 0 : query.isDeleted) !== undefined)
        newQuery.isDeleted = query.isDeleted;
    if ((query === null || query === void 0 ? void 0 : query.isActive) !== undefined) {
        newQuery.isActive = query.isActive === 'true'; // Correctly convert 'true' string to boolean true
    }
    if ((query === null || query === void 0 ? void 0 : query.isHalal) !== undefined)
        newQuery.isHalal = query.isHalal === 'true';
    if (query === null || query === void 0 ? void 0 : query.howToHearAboutDesiTracker)
        newQuery.howToHearAboutDesiTracker = query.howToHearAboutDesiTracker;
    // Features filtering
    if (query === null || query === void 0 ? void 0 : query.acceptedPaymentMethod)
        newQuery['features.acceptedPaymentMethod'] = query.acceptedPaymentMethod;
    if (query === null || query === void 0 ? void 0 : query.officialLanguage)
        newQuery['features.officialLanguage'] = query.officialLanguage;
    if (query === null || query === void 0 ? void 0 : query.secondLanguage)
        newQuery['features.secondLanguage'] = query.secondLanguage;
    if (query === null || query === void 0 ? void 0 : query.foodOptions)
        newQuery['features.foodOptions'] = query.foodOptions;
    if ((query === null || query === void 0 ? void 0 : query.offerSpecialDiscount) !== undefined)
        newQuery['features.offerSpecialDiscount'] =
            query.offerSpecialDiscount === 'true';
    if ((query === null || query === void 0 ? void 0 : query.isWheelChairAccessible) !== undefined)
        newQuery['features.isWheelChairAccessible'] =
            query.isWheelChairAccessible === 'true';
    // Contact details
    if (query === null || query === void 0 ? void 0 : query.phoneNumber)
        newQuery['contactDetails.phoneNumber'] = query.phoneNumber;
    if (query === null || query === void 0 ? void 0 : query.email)
        newQuery['contactDetails.email'] = query.email;
    // Operation details
    if ((query === null || query === void 0 ? void 0 : query.provideHomeDelivery) !== undefined)
        newQuery['operationDetails.provideHomeDelivery'] =
            query.provideHomeDelivery === 'true';
    if ((query === null || query === void 0 ? void 0 : query.provideOnlineService) !== undefined)
        newQuery['operationDetails.provideOnlineService'] =
            query.provideOnlineService === 'true';
    if ((query === null || query === void 0 ? void 0 : query.offerInStorePickup) !== undefined)
        newQuery['operationDetails.offerInStorePickup'] =
            query.offerInStorePickup === 'true';
    if ((query === null || query === void 0 ? void 0 : query.isParkingAvailable) !== undefined)
        newQuery['operationDetails.isParkingAvailable'] =
            query.isParkingAvailable === 'true';
    if ((query === null || query === void 0 ? void 0 : query.offerOnlineBooking) !== undefined)
        newQuery['operationDetails.offerOnlineBooking'] =
            query.offerOnlineBooking === 'true';
    if (query === null || query === void 0 ? void 0 : query.onlineBookingLink)
        newQuery['operationDetails.onlineBookingLink'] =
            query.onlineBookingLink;
    // Location
    //
    // The region tier goes by three names. The app has always sent `state`, the
    // schema has always stored `division`, and neither is the right word for a
    // UK county or a Brazilian state — so `region` is the country-neutral one.
    // All three query names are accepted, and any of them matches a business
    // that recorded the value under any of the three, because until now the
    // filter looked only at `locations.state`, a field the schema did not
    // define. It could never match a document, which is why the region step of
    // the app's search always came back empty.
    if (query === null || query === void 0 ? void 0 : query.city)
        newQuery['locations.city'] = query.city;
    if (query === null || query === void 0 ? void 0 : query.country)
        newQuery['locations.country'] = query.country;
    //
    // Wrapped in $and, not a bare $or: QueryBuilder.search() already puts an
    // $or on the query for searchTerm, and two $or keys on the same find would
    // overwrite each other — silently breaking search for anyone who also
    // filtered by region.
    const regionValue = (query === null || query === void 0 ? void 0 : query.region) || (query === null || query === void 0 ? void 0 : query.division) || (query === null || query === void 0 ? void 0 : query.state);
    if (regionValue) {
        newQuery['$and'] = [
            {
                $or: [
                    { 'locations.region': regionValue },
                    { 'locations.division': regionValue },
                    { 'locations.state': regionValue },
                ],
            },
        ];
    }
    // Pagination
    if (query === null || query === void 0 ? void 0 : query.page)
        newQuery.page = parseInt(query.page);
    if (query === null || query === void 0 ? void 0 : query.limit)
        newQuery.limit = parseInt(query.limit);
    // Log the query to verify
    const businessQuery = new queryBuilder_1.default(business_model_1.Business.find({ isDeleted: false }).populate([
        { path: 'owner', model: 'User' },
        { path: 'category', model: 'Category' },
        { path: 'subCategory', model: 'Subcategory' },
    ]), newQuery)
        .search([
        'businessName',
        'contactDetails.email',
        'locations.address',
        'locations.exactBusinessLocation', // Make sure this is included
        'locations.city',
        'locations.country',
        'description',
    ])
        .filter()
        .sort()
        .paginate()
        .fieldsLimit();
    // Execute the query to fetch the results
    const result = yield businessQuery.modelQuery;
    const meta = yield businessQuery.countTotal(); // Get the total count of results
    return {
        meta,
        result,
    };
});
const getSingleBusiness = (slug, req) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const query = mongoose_1.Types.ObjectId.isValid(slug) ? { $or: [{ _id: slug }, { slug }] } : { slug };
    const result = yield business_model_1.Business.findOne(query).populate([
        { path: 'owner', model: 'User' },
        { path: 'category', model: 'Category' },
        { path: 'subCategory', model: 'Subcategory' },
    ]);
    if (!result) {
        throw new AppError_1.default(404, `Business with slug ${slug} is not found`);
    }
    yield visitorCount_service_1.VisitorCountServices.addToVisitorCount((_a = result === null || result === void 0 ? void 0 : result._id) === null || _a === void 0 ? void 0 : _a.toString(), req);
    return result;
});
const deleteBusiness = (slug, decodedUser) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const business = yield business_model_1.Business.findOne({ slug });
    if (!business) {
        throw new AppError_1.default(404, `Business with slug ${slug} is not found`);
    }
    // Only the owner of THIS business (or an admin) may delete it. An owner can
    // delete their own business if they leave the platform — but cannot delete
    // anyone else's. (Was previously gated on role 'user', which never matched.)
    const isAdmin = (decodedUser === null || decodedUser === void 0 ? void 0 : decodedUser.role) === auth_constants_1.USER_ROLE.ADMIN;
    const isOwnerOfThis = ((_a = decodedUser === null || decodedUser === void 0 ? void 0 : decodedUser.id) === null || _a === void 0 ? void 0 : _a.toString()) === ((_b = business === null || business === void 0 ? void 0 : business.owner) === null || _b === void 0 ? void 0 : _b.toString());
    if (!isAdmin && !isOwnerOfThis) {
        throw new AppError_1.default(403, `You are not authorized to delete the business with slug ${slug}.`);
    }
    // Cascade-clean every record tied to this business (staff, orders, bookings,
    // reviews, shifts, inventory, etc.) so nothing is left pointing at a deleted
    // business. Auto-discovers all related collections — see cascadeCleanup.ts.
    yield (0, cascadeCleanup_1.cleanupBusinessRelations)(business._id);
    // Delete the business
    const result = yield business_model_1.Business.findByIdAndUpdate(business._id, { isDeleted: true }, { new: true, runValidators: true });
    if (!result) {
        throw new AppError_1.default(404, `Business with slug ${slug} is not found`);
    }
    return result;
});
const getAllBusinessListings = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const newQuery = {};
    // Helper function to check if the value is valid (not empty, not false, and not "false")
    const isValidValue = (value) => {
        return (value !== '' &&
            value !== false &&
            value !== 'false' &&
            value !== undefined &&
            value !== null);
    };
    // Check if value is valid before adding to query
    const addFilterIfValid = (key, value) => {
        if (isValidValue(value)) {
            newQuery[key] = value;
        }
    };
    // Basic Fields
    addFilterIfValid('searchTerm', query === null || query === void 0 ? void 0 : query.searchTerm);
    addFilterIfValid('businessName', query === null || query === void 0 ? void 0 : query.businessName);
    addFilterIfValid('owner', (query === null || query === void 0 ? void 0 : query.owner) ? new mongoose_1.Types.ObjectId(query === null || query === void 0 ? void 0 : query.owner) : undefined);
    addFilterIfValid('slug', query === null || query === void 0 ? void 0 : query.slug);
    addFilterIfValid('category', (query === null || query === void 0 ? void 0 : query.category)
        ? new mongoose_1.Types.ObjectId(query === null || query === void 0 ? void 0 : query.category)
        : undefined);
    addFilterIfValid('subCategory', (query === null || query === void 0 ? void 0 : query.subCategory)
        ? new mongoose_1.Types.ObjectId(query === null || query === void 0 ? void 0 : query.subCategory)
        : undefined);
    addFilterIfValid('established', query === null || query === void 0 ? void 0 : query.established);
    addFilterIfValid('isDeleted', query === null || query === void 0 ? void 0 : query.isDeleted);
    addFilterIfValid('isActive', (query === null || query === void 0 ? void 0 : query.isActive) === "true");
    addFilterIfValid('howToHearAboutDesiTracker', query === null || query === void 0 ? void 0 : query.howToHearAboutDesiTracker);
    // Features Filtering
    addFilterIfValid('features.acceptedPaymentMethod', query === null || query === void 0 ? void 0 : query.acceptedPaymentMethod);
    addFilterIfValid('features.officialLanguage', query === null || query === void 0 ? void 0 : query.officialLanguage);
    addFilterIfValid('features.foodOptions', query === null || query === void 0 ? void 0 : query.foodOptions);
    addFilterIfValid('features.offerSpecialDiscount', query === null || query === void 0 ? void 0 : query.offerSpecialDiscount);
    addFilterIfValid('features.isWheelChairAccessible', query === null || query === void 0 ? void 0 : query.isWheelChairAccessible);
    // Contact Details
    addFilterIfValid('contactDetails.phoneNumber', query === null || query === void 0 ? void 0 : query.phoneNumber);
    addFilterIfValid('contactDetails.email', query === null || query === void 0 ? void 0 : query.email);
    // Operation Details
    addFilterIfValid('operationDetails.provideHomeDelivery', query === null || query === void 0 ? void 0 : query.provideHomeDelivery);
    addFilterIfValid('operationDetails.provideOnlineService', query === null || query === void 0 ? void 0 : query.provideOnlineService);
    addFilterIfValid('operationDetails.offerInStorePickup', query === null || query === void 0 ? void 0 : query.offerInStorePickup);
    addFilterIfValid('operationDetails.isParkingAvailable', query === null || query === void 0 ? void 0 : query.isParkingAvailable);
    addFilterIfValid('operationDetails.offerOnlineBooking', query === null || query === void 0 ? void 0 : query.offerOnlineBooking);
    addFilterIfValid('operationDetails.onlineBookingLink', query === null || query === void 0 ? void 0 : query.onlineBookingLink);
    // Location Filtering
    addFilterIfValid('locations.city', query === null || query === void 0 ? void 0 : query.city);
    addFilterIfValid('locations.state', query === null || query === void 0 ? void 0 : query.state);
    addFilterIfValid('locations.country', query === null || query === void 0 ? void 0 : query.country);
    // Build query with the valid filters
    const businessQuery = new queryBuilder_1.default(business_model_1.Business.find({ isDeleted: false, isActive: true }).populate([
        { path: 'owner', model: 'User' },
        { path: 'category', model: 'Category' },
        { path: 'subCategory', model: 'Subcategory' },
    ]), newQuery)
        .search([
        'businessName',
        'contactDetails.email',
        'locations.address',
        'description',
        'locations.exactBusinessLocation',
    ])
        .filter()
        .sort()
        .paginate()
        .fieldsLimit();
    // Execute query
    const result = yield businessQuery.modelQuery;
    const meta = yield businessQuery.countTotal();
    return {
        meta,
        result,
    };
});
const setManagerPin = (businessId, pin) => __awaiter(void 0, void 0, void 0, function* () {
    const raw = (pin || '').trim();
    if (!/^\d{4,8}$/.test(raw)) {
        throw new AppError_1.default(400, 'PIN must be 4-8 digits');
    }
    const hashed = yield bcrypt_1.default.hash(raw, 10);
    const updated = yield business_model_1.Business.findByIdAndUpdate(businessId, { managerPin: hashed }, { new: true });
    if (!updated)
        throw new AppError_1.default(404, 'Business not found');
    return { ok: true };
});
const verifyManagerPin = (businessId, pin) => __awaiter(void 0, void 0, void 0, function* () {
    const raw = (pin || '').trim();
    if (!raw)
        throw new AppError_1.default(400, 'PIN is required');
    const biz = yield business_model_1.Business.findById(businessId).select('+managerPin');
    if (!biz)
        throw new AppError_1.default(404, 'Business not found');
    if (!biz.managerPin) {
        throw new AppError_1.default(400, 'Manager PIN not configured for this business');
    }
    const ok = yield bcrypt_1.default.compare(raw, biz.managerPin);
    if (!ok)
        throw new AppError_1.default(401, 'Incorrect PIN');
    return { ok: true };
});
exports.BusinessServices = {
    registerBusiness,
    updateBusiness,
    getAllBusiness,
    getSingleBusiness,
    deleteBusiness,
    getAllBusinessListings,
    setManagerPin,
    verifyManagerPin,
};
