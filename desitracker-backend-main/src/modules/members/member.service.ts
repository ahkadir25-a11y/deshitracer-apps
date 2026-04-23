import { Member, getNextSerial, IMember } from './member.model';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { sendImageToCloudinary } from '../../utils/lib/sendImageToCloudinery';
import { config } from '../../middlewares/config';
import Product from '../product/product.model';
import crypto from 'crypto';
import { DeactivationRequest, IDeactivationRequest } from './member.deactivation.model';
import { Types } from 'mongoose';
import { MemberLead } from './member.lead.model';
import DayOffer from "../product/dayOffer.model";
import sendEmail from '../../utils/lib/sendEmail';

// small helper: chunk array
function chunk<T>(arr: T[], size: number) {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function prettyDate(d?: Date | string | null) {
  if (!d) return "—";
  const dt = typeof d === "string" ? new Date(d) : d;
  return isNaN(dt.getTime()) ? "—" : dt.toDateString();
}

function buildPromoHtml(opts: {
  leadName?: string;
  businessName?: string;
  discountPercent?: number;
  day?: string;
  start?: string;
  end?: string;
  logo?: string;
  message?: string;
  link?: string;
}) {
  const {
    leadName,
    businessName,
    discountPercent,
    day,
    start,
    end,
    logo,
    message,
    link,
  } = opts;

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

export async function sendPromotionToLeads(opts: {
  ownerMemberId?: string;
  offerId: string;
  subject?: string;
  message?: string;
}) {
  const { ownerMemberId, offerId, subject, message } = opts;

  if (!Types.ObjectId.isValid(offerId)) throw new Error("Invalid offerId");

  // 1) Load offer (and business)
  const offer = await DayOffer.findById(offerId)
    .populate("business_id")
    .lean();

  if (!offer) throw new Error("Offer not found");

  const business: any = offer.business_id || {};
  const businessName: string = business.businessName || "Promotion";
  const logo: string | undefined = business.logo;

  // OPTIONAL link (adjust to your real frontend route)
  const link = business?.slug
    ? `${config.frontendBaseUrl}/business/${business.slug}`
    : undefined;

  // 2) Load leads (lead members)
  const leads = await MemberLead.find({ owner_member_id: ownerMemberId })
    .populate("lead_member_id", "name email deletedAt")
    .lean();

  const leadMembers = leads
    .map((x: any) => x.lead_member_id)
    .filter(Boolean)
    .filter((m: any) => !m.deletedAt);

  const totalLeads = leadMembers.length;

  // 3) Filter recipients with email
  const recipients = leadMembers.filter((m: any) => typeof m.email === "string" && m.email.trim());

  const skippedNoEmail = totalLeads - recipients.length;

  const emailSubject = subject?.trim() || `🎉 ${businessName} - Special Offer`;
  const start = prettyDate(offer.start_date);
  const end = prettyDate(offer.end_date);

  // 4) Send emails in small batches (avoid SMTP overload)
  const batches = chunk(recipients, 10);

  let sent = 0;
  let failed = 0;

  for (const batch of batches) {
    const results = await Promise.allSettled(
      batch.map((m: any) =>
        sendEmail({
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
        })
      )
    );

    for (const r of results) {
      if (r.status === "fulfilled") sent += 1;
      else failed += 1;
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
}

// Add a member as lead
export async function addLead(ownerMemberId: string, leadMemberId: string) {
  if (!Types.ObjectId.isValid(leadMemberId)) throw new Error('Invalid member id');

  if (ownerMemberId === leadMemberId) {
    throw new Error("You can't add yourself as lead");
  }

  // Ensure lead member exists + not deleted
  const leadMember = await Member.findOne({ _id: leadMemberId, deletedAt: null })
    .select('serialNumber name phone profileImageUrl active deletedAt')
    .lean();

  if (!leadMember) throw new Error('Member not found');

  try {
    const doc = await MemberLead.create({
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
  } catch (e: any) {
    // Duplicate key error => already added
    if (e?.code === 11000) throw new Error('Already added as lead');
    throw e;
  }
}

// Remove a lead by leadMemberId
export async function removeLead(ownerMemberId: string, leadMemberId: string) {
  const deleted = await MemberLead.findOneAndDelete({
    owner_member_id: ownerMemberId,
    lead_member_id: leadMemberId,
  });

  if (!deleted) throw new Error('Lead not found');
  return { message: 'Lead removed' };
}

// List my leads (paged)
export async function listMyLeads(opts: { ownerMemberId: string; page?: number; limit?: number; q?: string }) {
  const { ownerMemberId, page = 1, limit = 20, q } = opts;

  const _page = Math.max(1, Number(page) || 1);
  const _limit = Math.max(1, Number(limit) || 20);
  const skip = (_page - 1) * _limit;

  // Filter lead members by q (optional)
  const memberMatch: any = { deletedAt: null };
  if (q && q.trim()) {
    const safe = q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const rx = new RegExp(safe, 'i');
    memberMatch.$or = [{ serialNumber: rx }, { name: rx }, { phone: rx }];
  }

  const pipeline: any[] = [
    { $match: { owner_member_id: new Types.ObjectId(ownerMemberId) } },

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
      $match: {
        'leadMember.deletedAt': null, ...(memberMatch.$or ? {
          $or: memberMatch.$or.map((c: any) => {
            const key = Object.keys(c)[0];
            return { [`leadMember.${key}`]: c[key] };
          })
        } : {})
      }
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

  const result = await MemberLead.aggregate([
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

  const { items, total } = result?.[0] || { items: [], total: 0 };

  return {
    items: items.map((x: any) => ({
      id: x._id,
      createdAt: x.createdAt,
      lead: {
        ...x.lead,
        profileImageUrl: x.lead.profileImageUrl || null,
        membershipStatus: x.lead.active ? 'Valid Member' : 'Inactive Member',
      },
    })),
    page: _page,
    limit: _limit,
    total,
    hasPrev: _page > 1,
    hasNext: skip + items.length < total,
  };
}
// ---- helpers ----
function generateQrSlug() {
  // ~12 chars, URL-safe. Adjust length if you want exactly 12.
  return crypto.randomBytes(9).toString('base64url').slice(0, 12);
}
async function createAndUploadQR(serial: string, slug: string): Promise<string> {
  const contentUrl = `${config.frontendBaseUrl}/verify/${slug}`;
  const pngBuffer = await QRCode.toBuffer(contentUrl, { type: 'png', margin: 1, width: 512 });

  const tmpDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
  const tmpPath = path.join(tmpDir, `qr-${serial}.png`);
  fs.writeFileSync(tmpPath, pngBuffer);

  const uploaded = await sendImageToCloudinary(
    `qr-${serial}`,
    tmpPath,
    `${config.cloudinaryImageFolderName}/qr`
  );
  console.log(uploaded)
  return (uploaded.secure_url as string) || (uploaded.url as string);
}

// ---- services ----
export async function registerMember(payload: {
  name: string; phone: string; password: string; city?: string; email?: string;
}): Promise<IMember> {
  const serial = await getNextSerial();
  const slug = generateQrSlug();
  const qrCodeUrl = await createAndUploadQR(serial, slug);

  const m = await Member.create({
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
}

export async function authenticateMember(phone: string, password: string): Promise<IMember> {
  const m = await Member.findOne({ phone, deletedAt: null }).select('+password');
  if (!m) throw new Error('Invalid credentials');
  const ok = await bcrypt.compare(password, m.password);
  if (!ok) throw new Error('Invalid credentials');
  (m as any).password = undefined;
  return m;
}

export function getMemberById(id: string) {
  return Member.findById(id);
}

export function updateMember(
  id: string,
  updates: Partial<Pick<IMember, 'name' | 'phone' | 'city'>>
) {
  return Member.findByIdAndUpdate(id, { $set: updates }, { new: true });
}

export async function uploadProfileImage(id: string, filePath: string): Promise<string> {
  const urlObj = await sendImageToCloudinary(
    `profile-${id}-${Date.now()}`,
    filePath,
    `${config.cloudinaryImageFolderName}/profiles`
  );
  const imageUrl = (urlObj.secure_url as string) || (urlObj.url as string);
  await Member.findByIdAndUpdate(id, { profileImageUrl: imageUrl });
  return imageUrl;
}

export function setActiveStatus(id: string, active: boolean) {
  return Member.findByIdAndUpdate(id, { active }, { new: true });
}

export async function deleteMember(id: string) {
  await Member.findByIdAndDelete(id);
}

export async function verifyBySlug(slug: string) {
  const m = await Member.findOne({ qrSlug: slug });
  if (!m || m.deletedAt) return { valid: false };
  return {
    valid: m.active && !m.deletedAt,
    name: m.name,
    profileImageUrl: m.profileImageUrl,
    phone: m.phone,
    serialNumber: m?.serialNumber,
    verification: m.active ? 'Active member' : 'Inactive member'
  };
}

export async function lookupBySerial(serial: string) {
  const m = await Member.findOne({ serialNumber: serial, deletedAt: null });
  if (!m) return null;
  return {
    name: m.name,
    phone: m.phone,
    serialNumber: m?.serialNumber,
    verification: m.active ? 'Active member' : 'Inactive member',
    printable: true
  };
}
export async function searchMemberBySerial(serial: string) {
  const m = await Member.findOne({ serialNumber: serial }).select(
    'name phone profileImageUrl active deletedAt serialNumber'
  );

  if (!m || m.deletedAt) return null;

  return {
    id: m._id,
    serialNumber: m.serialNumber,
    name: m.name,
    phone: m.phone,
    profileImageUrl: m.profileImageUrl || null,
    membershipStatus: m.active ? 'Valid Member' : 'Inactive Member',
  };
}


// --- ADD these to member.service.ts ---

/** Paged list/search for members (admin/backoffice). */
export async function pagedMemberSearch(opts: { q?: string; page: number; limit: number }) {
  const { q, page, limit } = opts;

  const filter: any = { deletedAt: null };
  if (q && q.trim()) {
    // escape regex specials, then case-insensitive match
    const safe = q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const rx = new RegExp(safe, "i");
    filter.$or = [{ serialNumber: rx }, { name: rx }, { phone: rx }];
  }

  const _page = Math.max(1, Number(page) || 1);
  const _limit = Math.max(1, Number(limit) || 10);
  const skip = (_page - 1) * _limit;

  const [items, total] = await Promise.all([
    Member.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(_limit)
      .select("serialNumber name phone profileImageUrl active")
      .lean(),
    Member.countDocuments(filter),
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
}

/** Activate/deactivate by serial (admin/backoffice). */
export async function setActiveStatusBySerial(serial: string, active: boolean) {
  const m = await Member.findOneAndUpdate(
    { serialNumber: serial, deletedAt: null },
    { $set: { active } },
    { new: true }
  ).select("name phone profileImageUrl active serialNumber");

  if (!m) throw new Error("Member not found");

  return {
    serialNumber: m.serialNumber,
    name: m.name,
    phone: m.phone,
    profileImageUrl: m.profileImageUrl || null,
    active: m.active,
    membershipStatus: m.active ? "Valid Member" : "Inactive Member",
  };
}

type OfferSearchOpts = {
  city?: string;
  country?: string;
  q?: string;
  min_discount?: number;
  page?: number;
  limit?: number;
};

export async function findRestaurantOffers(opts: OfferSearchOpts) {
  const { city, q, min_discount, page, limit, country } = opts;
  const now = new Date();

  const matchActiveDiscount = {
    $and: [
      { discount_percent: { $gt: 0 } },
      { $or: [{ discount_start: null }, { discount_start: { $lte: now } }] },
      { $or: [{ discount_end: null }, { discount_end: { $gte: now } }] },
    ],
  };

  const pipeline: any[] = [
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
  console.log({ city })
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
  const limitNum = Math.max(1, Number(limit) || 12);
  const skip = (pageNum - 1) * limitNum;

  const paged = await Product.aggregate([
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
}

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}







export async function createDeactivationRequest(opts: {
  memberId: string;
  reason?: string;
  note?: string;
}): Promise<IDeactivationRequest> {
  const m = await Member.findById(opts.memberId);
  if (!m || m.deletedAt) {
    throw new Error('Member not found');
  }

  // Optional guard: avoid duplicate pending requests
  const existing = await DeactivationRequest.findOne({ member_id: m._id, status: 'pending' });
  if (existing) return existing;

  const reqDoc = await DeactivationRequest.create({
    member_id: m._id,
    serialNumber: m.serialNumber,
    name: m.name,
    phone: m.phone,
    reason: opts.reason,
    note: opts.note,
    status: 'pending',
  });
  return reqDoc;
}

export async function listDeactivationRequests(opts: {
  status?: 'pending' | 'accepted' | 'rejected';
  q?: string;
  page?: number;
  limit?: number;
}) {
  const { status, q, page = 1, limit = 20 } = opts;

  const filter: any = {};
  if (status) filter.status = status;

  if (q && q.trim()) {
    const safe = q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const rx = new RegExp(safe, 'i');
    filter.$or = [{ serialNumber: rx }, { name: rx }, { phone: rx }];
  }

  const _page = Math.max(1, Number(page) || 1);
  const _limit = Math.max(1, Number(limit) || 20);
  const skip = (_page - 1) * _limit;

  const [items, total] = await Promise.all([
    DeactivationRequest.find(filter).sort({ createdAt: -1 }).skip(skip).limit(_limit).lean(),
    DeactivationRequest.countDocuments(filter),
  ]);

  return {
    items,
    page: _page,
    limit: _limit,
    total,
    hasPrev: _page > 1,
    hasNext: skip + items.length < total,
  };
}

export async function listMyDeactivationRequests(memberId: string) {
  return DeactivationRequest.find({ member_id: memberId }).sort({ createdAt: -1 }).lean();
}

export async function acceptDeactivationRequest(id: string, processedBy?: string, processedNote?: string) {
  // 1) find request
  const reqDoc = await DeactivationRequest.findById(id);
  if (!reqDoc) throw new Error('Request not found');
  if (reqDoc.status !== 'pending') throw new Error('Request is already processed');

  // 2) deactivate member
  await Member.findByIdAndUpdate(reqDoc.member_id, { $set: { active: false } });

  // 3) mark request as accepted
  reqDoc.status = 'accepted';
  reqDoc.processedAt = new Date();
  reqDoc.processedBy = processedBy ?? null;
  if (processedNote) reqDoc.processedNote = processedNote;
  await reqDoc.save();

  return {
    request: reqDoc.toObject(),
    member: await Member.findById(reqDoc.member_id).select('serialNumber name phone active').lean(),
  };
}
