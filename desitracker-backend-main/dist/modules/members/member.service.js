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
exports.sendPromotionToLeads = sendPromotionToLeads;
exports.addLead = addLead;
exports.removeLead = removeLead;
exports.listMyLeads = listMyLeads;
exports.registerMember = registerMember;
exports.authenticateMember = authenticateMember;
exports.getMemberById = getMemberById;
exports.updateMember = updateMember;
exports.uploadProfileImage = uploadProfileImage;
exports.setActiveStatus = setActiveStatus;
exports.deleteMember = deleteMember;
exports.verifyBySlug = verifyBySlug;
exports.lookupBySerial = lookupBySerial;
exports.searchMemberBySerial = searchMemberBySerial;
exports.pagedMemberSearch = pagedMemberSearch;
exports.setActiveStatusBySerial = setActiveStatusBySerial;
exports.findRestaurantOffers = findRestaurantOffers;
exports.createDeactivationRequest = createDeactivationRequest;
exports.listDeactivationRequests = listDeactivationRequests;
exports.listMyDeactivationRequests = listMyDeactivationRequests;
exports.saveMemberPushToken = saveMemberPushToken;
exports.getScanHistory = getScanHistory;
exports.acceptDeactivationRequest = acceptDeactivationRequest;
const member_model_1 = require("./member.model");
const member_scan_model_1 = require("./member.scan.model");
const qrcode_1 = __importDefault(require("qrcode"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const sendImageToCloudinery_1 = require("../../utils/lib/sendImageToCloudinery");
const config_1 = require("../../middlewares/config");
const product_model_1 = __importDefault(require("../product/product.model"));
const crypto_1 = __importDefault(require("crypto"));
const member_deactivation_model_1 = require("./member.deactivation.model");
const mongoose_1 = require("mongoose");
const member_lead_model_1 = require("./member.lead.model");
const dayOffer_model_1 = __importDefault(require("../product/dayOffer.model"));
const sendEmail_1 = __importDefault(require("../../utils/lib/sendEmail"));
const user_model_1 = require("../user/user/user.model");
// small helper: chunk array
function chunk(arr, size) {
    const out = [];
    for (let i = 0; i < arr.length; i += size)
        out.push(arr.slice(i, i + size));
    return out;
}
function prettyDate(d) {
    if (!d)
        return "—";
    const dt = typeof d === "string" ? new Date(d) : d;
    return isNaN(dt.getTime()) ? "—" : dt.toDateString();
}
function buildPromoHtml(opts) {
    const { leadName, businessName, discountPercent, day, start, end, logo, message, link, } = opts;
    return `
  <div style="font-family:Arial,sans-serif;line-height:1.5">
    ${logo ? `<img src="${logo}" alt="${businessName || "Business"}" style="max-height:60px;margin-bottom:12px" />` : ""}
    <h2 style="margin:0 0 8px 0;">${businessName || "New Promotion"}</h2>
    <p style="margin:0 0 12px 0;">Hello ${leadName || "there"},</p>

    ${message ? `<p style="margin:0 0 12px 0;">${message}</p>` : ""}

    <div style="border:1px solid #e5e7eb;border-radius:10px;padding:12px;margin:12px 0;">
      <div><b>Discount:</b> ${typeof discountPercent === "number" ? `${discountPercent}%` : "—"}</div>
      <div><b>Day:</b> ${day || "—"}</div>
      <div><b>Valid:</b> ${start || "—"} to ${end || "—"}</div>
    </div>

    ${link ? `<p><a href="${link}" style="color:#2563eb">View offer</a></p>` : ""}

    <p style="margin-top:16px;color:#6b7280;font-size:12px">
      You are receiving this email because you were added as a lead in Deshi Tracker.
    </p>
  </div>`;
}
function sendPromotionToLeads(opts) {
    return __awaiter(this, void 0, void 0, function* () {
        const { ownerMemberId, offerId, subject, message } = opts;
        if (!mongoose_1.Types.ObjectId.isValid(offerId))
            throw new Error("Invalid offerId");
        // 1) Load offer (and business)
        const offer = yield dayOffer_model_1.default.findById(offerId)
            .populate("business_id")
            .lean();
        if (!offer)
            throw new Error("Offer not found");
        const business = offer.business_id || {};
        const businessName = business.businessName || "Promotion";
        const logo = business.logo;
        // OPTIONAL link (adjust to your real frontend route)
        const link = (business === null || business === void 0 ? void 0 : business.slug)
            ? `${config_1.config.frontendBaseUrl}/business/${business.slug}`
            : undefined;
        // 2) Load leads (lead members)
        const leads = yield member_lead_model_1.MemberLead.find({ owner_member_id: ownerMemberId })
            .populate("lead_member_id", "name email deletedAt")
            .lean();
        const leadMembers = leads
            .map((x) => x.lead_member_id)
            .filter(Boolean)
            .filter((m) => !m.deletedAt);
        const totalLeads = leadMembers.length;
        // 3) Filter recipients with email
        const recipients = leadMembers.filter((m) => typeof m.email === "string" && m.email.trim());
        const skippedNoEmail = totalLeads - recipients.length;
        const emailSubject = (subject === null || subject === void 0 ? void 0 : subject.trim()) || `🎉 ${businessName} - Special Offer`;
        const start = prettyDate(offer.start_date);
        const end = prettyDate(offer.end_date);
        // 4) Send emails in small batches (avoid SMTP overload)
        const batches = chunk(recipients, 10);
        let sent = 0;
        let failed = 0;
        for (const batch of batches) {
            const results = yield Promise.allSettled(batch.map((m) => (0, sendEmail_1.default)({
                email: m.email,
                subject: emailSubject,
                message: buildPromoHtml({
                    leadName: m.name,
                    businessName,
                    discountPercent: offer.discount_percent,
                    day: offer.day,
                    start,
                    end,
                    logo,
                    message,
                    link,
                }),
            })));
            for (const r of results) {
                if (r.status === "fulfilled")
                    sent += 1;
                else
                    failed += 1;
            }
        }
        return {
            offerId,
            totalLeads,
            recipients: recipients.length,
            sent,
            failed,
            skippedNoEmail,
        };
    });
}
// Add a member as lead
function addLead(ownerMemberId, leadMemberId) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!mongoose_1.Types.ObjectId.isValid(leadMemberId))
            throw new Error('Invalid member id');
        if (ownerMemberId === leadMemberId) {
            throw new Error("You can't add yourself as lead");
        }
        // Ensure lead member exists + not deleted
        const leadMember = yield member_model_1.Member.findOne({ _id: leadMemberId, deletedAt: null })
            .select('serialNumber name phone profileImageUrl active deletedAt')
            .lean();
        if (!leadMember)
            throw new Error('Member not found');
        try {
            const doc = yield member_lead_model_1.MemberLead.create({
                owner_member_id: ownerMemberId,
                lead_member_id: leadMemberId,
            });
            return {
                id: doc._id,
                lead: {
                    id: leadMember._id,
                    serialNumber: leadMember.serialNumber,
                    name: leadMember.name,
                    phone: leadMember.phone,
                    profileImageUrl: leadMember.profileImageUrl || null,
                    active: leadMember.active,
                    membershipStatus: leadMember.active ? 'Valid Member' : 'Inactive Member',
                },
                createdAt: doc.createdAt,
            };
        }
        catch (e) {
            // Duplicate key error => already added
            if ((e === null || e === void 0 ? void 0 : e.code) === 11000)
                throw new Error('Already added as lead');
            throw e;
        }
    });
}
// Remove a lead by leadMemberId
function removeLead(ownerMemberId, leadMemberId) {
    return __awaiter(this, void 0, void 0, function* () {
        const deleted = yield member_lead_model_1.MemberLead.findOneAndDelete({
            owner_member_id: ownerMemberId,
            lead_member_id: leadMemberId,
        });
        if (!deleted)
            throw new Error('Lead not found');
        return { message: 'Lead removed' };
    });
}
// List my leads (paged)
function listMyLeads(opts) {
    return __awaiter(this, void 0, void 0, function* () {
        const { ownerMemberId, page = 1, limit = 20, q } = opts;
        const _page = Math.max(1, Number(page) || 1);
        const _limit = Math.min(100, Math.max(1, Number(limit) || 20));
        const skip = (_page - 1) * _limit;
        // Filter lead members by q (optional)
        const memberMatch = { deletedAt: null };
        if (q && q.trim()) {
            const safe = q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const rx = new RegExp(safe, 'i');
            memberMatch.$or = [{ serialNumber: rx }, { name: rx }, { phone: rx }];
        }
        const pipeline = [
            { $match: { owner_member_id: new mongoose_1.Types.ObjectId(ownerMemberId) } },
            // join lead member
            {
                $lookup: {
                    from: 'members',
                    localField: 'lead_member_id',
                    foreignField: '_id',
                    as: 'leadMember',
                },
            },
            { $unwind: '$leadMember' },
            // only non-deleted + optional q
            {
                $match: Object.assign({ 'leadMember.deletedAt': null }, (memberMatch.$or ? {
                    $or: memberMatch.$or.map((c) => {
                        const key = Object.keys(c)[0];
                        return { [`leadMember.${key}`]: c[key] };
                    })
                } : {}))
            },
            { $sort: { createdAt: -1 } },
            {
                $project: {
                    _id: 1,
                    createdAt: 1,
                    lead: {
                        id: '$leadMember._id',
                        serialNumber: '$leadMember.serialNumber',
                        name: '$leadMember.name',
                        phone: '$leadMember.phone',
                        profileImageUrl: '$leadMember.profileImageUrl',
                        active: '$leadMember.active',
                    },
                },
            },
        ];
        const result = yield member_lead_model_1.MemberLead.aggregate([
            {
                $facet: {
                    items: [...pipeline, { $skip: skip }, { $limit: _limit }],
                    totalCount: [...pipeline, { $count: 'count' }],
                },
            },
            {
                $project: {
                    items: 1,
                    total: { $ifNull: [{ $arrayElemAt: ['$totalCount.count', 0] }, 0] },
                },
            },
        ]);
        const { items, total } = (result === null || result === void 0 ? void 0 : result[0]) || { items: [], total: 0 };
        return {
            items: items.map((x) => ({
                id: x._id,
                createdAt: x.createdAt,
                lead: Object.assign(Object.assign({}, x.lead), { profileImageUrl: x.lead.profileImageUrl || null, membershipStatus: x.lead.active ? 'Valid Member' : 'Inactive Member' }),
            })),
            page: _page,
            limit: _limit,
            total,
            hasPrev: _page > 1,
            hasNext: skip + items.length < total,
        };
    });
}
// ---- helpers ----
function generateQrSlug() {
    // ~12 chars, URL-safe. Adjust length if you want exactly 12.
    return crypto_1.default.randomBytes(9).toString('base64url').slice(0, 12);
}
function createAndUploadQR(serial, slug) {
    return __awaiter(this, void 0, void 0, function* () {
        const contentUrl = `${config_1.config.frontendBaseUrl}/verify/${slug}`;
        const pngBuffer = yield qrcode_1.default.toBuffer(contentUrl, { type: 'png', margin: 1, width: 512 });
        const tmpDir = path_1.default.join(process.cwd(), 'uploads');
        if (!fs_1.default.existsSync(tmpDir))
            fs_1.default.mkdirSync(tmpDir, { recursive: true });
        const tmpPath = path_1.default.join(tmpDir, `qr-${serial}.png`);
        fs_1.default.writeFileSync(tmpPath, pngBuffer);
        const uploaded = yield (0, sendImageToCloudinery_1.sendImageToCloudinary)(`qr-${serial}`, tmpPath, `${config_1.config.cloudinaryImageFolderName}/qr`);
        console.log(uploaded);
        return uploaded.secure_url || uploaded.url;
    });
}
// ---- services ----
function registerMember(payload) {
    return __awaiter(this, void 0, void 0, function* () {
        // One email = one role across the whole platform: an email already used by
        // a staff/owner/admin account (User collection) can't also become a member.
        if (payload.email) {
            const emailLc = payload.email.toLowerCase();
            const existingUser = yield user_model_1.User.findOne({ email: emailLc, isDeleted: { $ne: true } });
            if (existingUser) {
                const label = existingUser.role === 'business_owner' ? 'Business Owner'
                    : existingUser.role === 'staff' ? 'Staff'
                        : existingUser.role === 'admin' ? 'Admin'
                            : 'user';
                throw new Error(`This email is already registered as a ${label} account. Please sign in there instead, or use a different email address.`);
            }
            const existingMember = yield member_model_1.Member.findOne({ email: emailLc, deletedAt: null });
            if (existingMember) {
                throw new Error('This email is already registered as a Member. Please sign in instead.');
            }
            payload.email = emailLc;
        }
        const serial = yield (0, member_model_1.getNextSerial)();
        const slug = generateQrSlug();
        const qrCodeUrl = yield createAndUploadQR(serial, slug);
        const m = yield member_model_1.Member.create({
            name: payload.name,
            phone: payload.phone,
            password: payload.password,
            city: payload.city,
            email: payload.email,
            serialNumber: serial,
            qrSlug: slug,
            qrCodeUrl,
        });
        return m;
    });
}
function authenticateMember(phone, password) {
    return __awaiter(this, void 0, void 0, function* () {
        const m = yield member_model_1.Member.findOne({ phone, deletedAt: null }).select('+password');
        if (!m)
            throw new Error('Invalid credentials');
        const ok = yield bcryptjs_1.default.compare(password, m.password);
        if (!ok)
            throw new Error('Invalid credentials');
        m.password = undefined;
        return m;
    });
}
function getMemberById(id) {
    return member_model_1.Member.findById(id);
}
function updateMember(id, updates) {
    return member_model_1.Member.findByIdAndUpdate(id, { $set: updates }, { new: true });
}
function uploadProfileImage(id, filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        const urlObj = yield (0, sendImageToCloudinery_1.sendImageToCloudinary)(`profile-${id}-${Date.now()}`, filePath, `${config_1.config.cloudinaryImageFolderName}/profiles`);
        const imageUrl = urlObj.secure_url || urlObj.url;
        yield member_model_1.Member.findByIdAndUpdate(id, { profileImageUrl: imageUrl });
        return imageUrl;
    });
}
function setActiveStatus(id, active) {
    return member_model_1.Member.findByIdAndUpdate(id, { active }, { new: true });
}
function deleteMember(id) {
    return __awaiter(this, void 0, void 0, function* () {
        yield member_model_1.Member.findByIdAndDelete(id);
    });
}
function verifyBySlug(slug, businessId, businessName) {
    return __awaiter(this, void 0, void 0, function* () {
        const m = yield member_model_1.Member.findOne({ qrSlug: slug });
        if (!m || m.deletedAt)
            return { valid: false };
        // log scan for discount history
        member_scan_model_1.MemberScan.create({
            member: m._id,
            businessId: businessId || undefined,
            businessName: businessName || undefined,
            scannedAt: new Date(),
        }).catch(() => { });
        return {
            valid: m.active && !m.deletedAt,
            name: m.name,
            profileImageUrl: m.profileImageUrl,
            phone: m.phone,
            serialNumber: m === null || m === void 0 ? void 0 : m.serialNumber,
            verification: m.active ? 'Active member' : 'Inactive member'
        };
    });
}
function lookupBySerial(serial) {
    return __awaiter(this, void 0, void 0, function* () {
        const m = yield member_model_1.Member.findOne({ serialNumber: serial, deletedAt: null });
        if (!m)
            return null;
        // This route is PUBLIC (membership verification). Do NOT expose phone here —
        // serials are enumerable, so returning phone leaks member contact info to
        // anyone. Name + status is enough to verify a membership at point of sale.
        return {
            name: m.name,
            serialNumber: m === null || m === void 0 ? void 0 : m.serialNumber,
            verification: m.active ? 'Active member' : 'Inactive member',
            printable: true
        };
    });
}
function searchMemberBySerial(serial) {
    return __awaiter(this, void 0, void 0, function* () {
        const m = yield member_model_1.Member.findOne({ serialNumber: serial }).select('name phone profileImageUrl active deletedAt serialNumber');
        if (!m || m.deletedAt)
            return null;
        return {
            id: m._id,
            serialNumber: m.serialNumber,
            name: m.name,
            phone: m.phone,
            profileImageUrl: m.profileImageUrl || null,
            membershipStatus: m.active ? 'Valid Member' : 'Inactive Member',
        };
    });
}
// --- ADD these to member.service.ts ---
/** Paged list/search for members (admin/backoffice). */
function pagedMemberSearch(opts) {
    return __awaiter(this, void 0, void 0, function* () {
        const { q, page, limit } = opts;
        const filter = { deletedAt: null };
        if (q && q.trim()) {
            // escape regex specials, then case-insensitive match
            const safe = q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const rx = new RegExp(safe, "i");
            filter.$or = [{ serialNumber: rx }, { name: rx }, { phone: rx }];
        }
        const _page = Math.max(1, Number(page) || 1);
        const _limit = Math.min(100, Math.max(1, Number(limit) || 10));
        const skip = (_page - 1) * _limit;
        const [items, total] = yield Promise.all([
            member_model_1.Member.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(_limit)
                .select("serialNumber name phone profileImageUrl active")
                .lean(),
            member_model_1.Member.countDocuments(filter),
        ]);
        return {
            items: items.map((m) => ({
                serialNumber: m.serialNumber,
                name: m.name,
                phone: m.phone,
                profileImageUrl: m.profileImageUrl || null,
                active: m.active,
                membershipStatus: m.active ? "Valid Member" : "Inactive Member",
            })),
            page: _page,
            limit: _limit,
            total,
            hasPrev: _page > 1,
            hasNext: skip + items.length < total,
        };
    });
}
/** Activate/deactivate by serial (admin/backoffice). */
function setActiveStatusBySerial(serial, active) {
    return __awaiter(this, void 0, void 0, function* () {
        const m = yield member_model_1.Member.findOneAndUpdate({ serialNumber: serial, deletedAt: null }, { $set: { active } }, { new: true }).select("name phone profileImageUrl active serialNumber");
        if (!m)
            throw new Error("Member not found");
        return {
            serialNumber: m.serialNumber,
            name: m.name,
            phone: m.phone,
            profileImageUrl: m.profileImageUrl || null,
            active: m.active,
            membershipStatus: m.active ? "Valid Member" : "Inactive Member",
        };
    });
}
function findRestaurantOffers(opts) {
    return __awaiter(this, void 0, void 0, function* () {
        const { city, q, min_discount, page, limit, country } = opts;
        const now = new Date();
        const matchActiveDiscount = {
            $and: [
                { discount_percent: { $gt: 0 } },
                { $or: [{ discount_start: null }, { discount_start: { $lte: now } }] },
                { $or: [{ discount_end: null }, { discount_end: { $gte: now } }] },
            ],
        };
        const pipeline = [
            { $match: matchActiveDiscount },
            // Join Business
            {
                $lookup: {
                    from: "businesses",
                    localField: "business_id",
                    foreignField: "_id",
                    as: "business",
                },
            },
            { $unwind: "$business" },
            // Join Category (Business.category -> Category)
            {
                $lookup: {
                    from: "categories",
                    localField: "business.category",
                    foreignField: "_id",
                    as: "category",
                },
            },
            { $unwind: "$category" },
            // Only Food & Dining
            { $match: { "category.name": { $regex: /^Food & Dining$/i } } },
        ];
        console.log({ city });
        /* ---------------------- Single 'city' matches all fields ---------------------- */
        if (city && city.trim()) {
            // EXACT, case-insensitive. For partial contains, remove ^ and $.
            const rx = new RegExp(`^${escapeRegex(city.trim())}$`, "i");
            pipeline.push({
                $match: {
                    $or: [
                        { "business.locations.city": { $regex: rx } },
                        { "business.locations.division": { $regex: rx } },
                        { "business.locations.district": { $regex: rx } },
                        { "business.locations.branches": { $elemMatch: { city: { $regex: rx } } } },
                    ],
                },
            });
        }
        /* ------------------------------- Other filters ------------------------------- */
        if (country && country.trim()) {
            // EXACT, case-insensitive match for country
            const countryRx = new RegExp(`^${escapeRegex(country.trim())}$`, "i");
            pipeline.push({
                $match: {
                    $or: [
                        { "business.locations.country": { $regex: countryRx } },
                        { "business.locations.branches": { $elemMatch: { country: { $regex: countryRx } } } },
                    ],
                },
            });
        }
        if (typeof min_discount === "number") {
            pipeline.push({ $match: { discount_percent: { $gte: min_discount } } });
        }
        if (q && q.trim()) {
            pipeline.push({
                $match: { name: { $regex: new RegExp(escapeRegex(q.trim()), "i") } },
            });
        }
        // Newest first
        pipeline.push({ $sort: { createdAt: -1 } });
        // Shape + compute final_price
        pipeline.push({
            $project: {
                _id: 1,
                name: 1,
                price: 1,
                currency: 1,
                description: 1,
                images: 1,
                thumbnail: 1,
                user_id: 1,
                business_id: 1,
                product_category_id: 1,
                discount_percent: 1,
                discount_start: 1,
                discount_end: 1,
                createdAt: 1,
                final_price: {
                    $round: [
                        { $multiply: ["$price", { $subtract: [1, { $divide: ["$discount_percent", 100] }] }] },
                        2,
                    ],
                },
                business: {
                    _id: "$business._id",
                    businessName: "$business.businessName",
                    logo: "$business.logo",
                    locations: "$business.locations",
                },
            },
        });
        /* -------------------------------- Pagination -------------------------------- */
        const pageNum = Math.max(1, Number(page) || 1);
        const limitNum = Math.min(100, Math.max(1, Number(limit) || 12));
        const skip = (pageNum - 1) * limitNum;
        const paged = yield product_model_1.default.aggregate([
            {
                $facet: {
                    items: [...pipeline, { $skip: skip }, { $limit: limitNum }],
                    totalCount: [...pipeline, { $count: "count" }],
                },
            },
            {
                $project: {
                    items: 1,
                    total: { $ifNull: [{ $arrayElemAt: ["$totalCount.count", 0] }, 0] },
                },
            },
        ]);
        const { items, total } = paged[0] || { items: [], total: 0 };
        return {
            items,
            page: pageNum,
            limit: limitNum,
            total,
            hasPrev: pageNum > 1,
            hasNext: skip + items.length < total,
        };
    });
}
function escapeRegex(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function createDeactivationRequest(opts) {
    return __awaiter(this, void 0, void 0, function* () {
        const m = yield member_model_1.Member.findById(opts.memberId);
        if (!m || m.deletedAt) {
            throw new Error('Member not found');
        }
        // Optional guard: avoid duplicate pending requests
        const existing = yield member_deactivation_model_1.DeactivationRequest.findOne({ member_id: m._id, status: 'pending' });
        if (existing)
            return existing;
        const reqDoc = yield member_deactivation_model_1.DeactivationRequest.create({
            member_id: m._id,
            serialNumber: m.serialNumber,
            name: m.name,
            phone: m.phone,
            reason: opts.reason,
            note: opts.note,
            status: 'pending',
        });
        return reqDoc;
    });
}
function listDeactivationRequests(opts) {
    return __awaiter(this, void 0, void 0, function* () {
        const { status, q, page = 1, limit = 20 } = opts;
        const filter = {};
        if (status)
            filter.status = status;
        if (q && q.trim()) {
            const safe = q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const rx = new RegExp(safe, 'i');
            filter.$or = [{ serialNumber: rx }, { name: rx }, { phone: rx }];
        }
        const _page = Math.max(1, Number(page) || 1);
        const _limit = Math.min(100, Math.max(1, Number(limit) || 20));
        const skip = (_page - 1) * _limit;
        const [items, total] = yield Promise.all([
            member_deactivation_model_1.DeactivationRequest.find(filter).sort({ createdAt: -1 }).skip(skip).limit(_limit).lean(),
            member_deactivation_model_1.DeactivationRequest.countDocuments(filter),
        ]);
        return {
            items,
            page: _page,
            limit: _limit,
            total,
            hasPrev: _page > 1,
            hasNext: skip + items.length < total,
        };
    });
}
function listMyDeactivationRequests(memberId) {
    return __awaiter(this, void 0, void 0, function* () {
        return member_deactivation_model_1.DeactivationRequest.find({ member_id: memberId }).sort({ createdAt: -1 }).lean();
    });
}
function saveMemberPushToken(memberId, token) {
    return __awaiter(this, void 0, void 0, function* () {
        yield member_model_1.Member.findByIdAndUpdate(memberId, { expoPushToken: token });
    });
}
function getScanHistory(memberId_1) {
    return __awaiter(this, arguments, void 0, function* (memberId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [items, total] = yield Promise.all([
            member_scan_model_1.MemberScan.find({ member: memberId })
                .sort({ scannedAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            member_scan_model_1.MemberScan.countDocuments({ member: memberId }),
        ]);
        return { items, page, limit, total, hasNext: skip + items.length < total };
    });
}
function acceptDeactivationRequest(id, processedBy, processedNote) {
    return __awaiter(this, void 0, void 0, function* () {
        // 1) find request
        const reqDoc = yield member_deactivation_model_1.DeactivationRequest.findById(id);
        if (!reqDoc)
            throw new Error('Request not found');
        if (reqDoc.status !== 'pending')
            throw new Error('Request is already processed');
        // 2) deactivate member
        yield member_model_1.Member.findByIdAndUpdate(reqDoc.member_id, { $set: { active: false } });
        // 3) mark request as accepted
        reqDoc.status = 'accepted';
        reqDoc.processedAt = new Date();
        reqDoc.processedBy = processedBy !== null && processedBy !== void 0 ? processedBy : null;
        if (processedNote)
            reqDoc.processedNote = processedNote;
        yield reqDoc.save();
        return {
            request: reqDoc.toObject(),
            member: yield member_model_1.Member.findById(reqDoc.member_id).select('serialNumber name phone active').lean(),
        };
    });
}
