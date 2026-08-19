import { Types } from "mongoose";
import { Business } from "../business/business.model";
import ProductCategory, { IProductCategory } from "./categoryModel";
import DayOffer, { IDayOffer, Weekday } from "./dayOffer.model";
import Product, { IProduct } from "./product.model";
import { Member } from "../members/member.model";
import { sendExpoPush } from "../../utils/lib/push";

interface IProductData {
  name: string;
  price: number;
  description: string;
  tags?: string[];
  images: { url: string; description: string }[];
  thumbnail: string;
  user_id: string;
  business_id: string;
  currency: string;
  product_category_id?: string;

  discount_percent?: number;
  discount_start?: Date | null;
  discount_end?: Date | null;

  // ✅ ADD THIS
  product_options_ids?: string[];
}


// Add a new product
export const addProduct = async ({
  name,
  price,
  description,
  tags = [],
  images,
  thumbnail,
  user_id,
  business_id,
  currency,
  product_category_id,

  discount_percent = 0,
  discount_start = null,
  discount_end = null,

  // ✅ ADD THIS
  product_options_ids = [],
}: IProductData): Promise<IProduct> => {
  const newProduct = new Product({
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

  await newProduct.save();
  return newProduct;
};
// Edit an existing product
export const editProduct = async (productId: string, updateData: Partial<IProductData>): Promise<IProduct | null> => {
  const updatedProduct = await Product.findByIdAndUpdate(productId, updateData, { new: true });
  return updatedProduct;
};
// Delete a product
export const deleteProduct = async (productId: string): Promise<{ message: string }> => {
  await Product.findByIdAndDelete(productId);
  return { message: 'Product deleted successfully' };
};

// Get all products by user and business
export const getProductsByUserAndBusiness = async (user_id: string, business_id: string): Promise<IProduct[]> => {
  const products = await Product.find({ user_id, business_id }).sort({ createdAt: -1 });
  return products;
};


// Get all products by user and business
export const getProductsCategoryByUserAndBusiness = async (user_id: string, business_id: string): Promise<IProductCategory[]> => {
  const categories = await ProductCategory.find({ user_id, business_id }).sort({ createdAt: -1 });
  return categories;
};


export const getProductsByCategory = async (
  product_category_id: string,
  user_id?: string,
  business_id?: string
): Promise<IProduct[]> => {
  console.log("Fetching products by category:", product_category_id, user_id, business_id);
  // Build a flexible MongoDB filter object
  const filter: Record<string, unknown> = { product_category_id };
  if (user_id) filter.user_id = user_id;
  if (business_id) filter.business_id = business_id;

  // Fetch and (optionally) populate related refs
  const products = await Product.find(filter)
    .populate('user_id')          // comment-out if you don’t need these
    .populate('business_id')      // to keep responses smaller
    .populate('product_category_id')
    .populate('product_options_ids')
    .sort({ createdAt: -1 })
  return products;
};
// product.service.ts


// Get a product by its ID and populate the user and business
export const getProductById = async (id: string): Promise<IProduct | null> => {
  // Populate user and business data
  const product = await Product.findById(id)
    .populate('user_id')  // Populating user with specific fields
    .populate('business_id')  // Populating business with specific fields
    .populate('product_options_ids');  // Populating business with specific fields

  return product;
};



export const bulkUpdateDiscount = async (
  params: {
    productIds?: string[];
    user_id?: string;
    business_id?: string;
    product_category_id?: string;
  },
  discount_percent: number,
  window?: { discount_start?: Date | null; discount_end?: Date | null } // NEW
): Promise<{ matchedCount: number; modifiedCount: number }> => {
  const filter: Record<string, any> = {};
  if (params.productIds?.length) filter._id = { $in: params.productIds };
  if (params.user_id) filter.user_id = params.user_id;
  if (params.business_id) filter.business_id = params.business_id;
  if (params.product_category_id) filter.product_category_id = params.product_category_id;

  const $set: Record<string, any> = { discount_percent };
  if (window) {
    if ('discount_start' in window) $set.discount_start = window.discount_start ?? null;
    if ('discount_end' in window) $set.discount_end = window.discount_end ?? null;
  }

  const result = await Product.updateMany(filter, { $set });
  return { matchedCount: result.matchedCount ?? 0, modifiedCount: result.modifiedCount ?? 0 };
};




// Normalize common day name inputs to Weekday
export function normalizeDayName(input: string): Weekday | null {
  if (!input) return null;
  const map: Record<string, Weekday> = {
    mon: 'Monday', monday: 'Monday',
    tue: 'Tuesday', tues: 'Tuesday', tuesday: 'Tuesday',
    wed: 'Wednesday', weds: 'Wednesday', wednesday: 'Wednesday',
    thu: 'Thursday', thur: 'Thursday', thurs: 'Thursday', thursday: 'Thursday',
    fri: 'Friday', friday: 'Friday',
    sat: 'Saturday', saturday: 'Saturday',
    sun: 'Sunday', sunday: 'Sunday',
  };
  return map[String(input).trim().toLowerCase()] ?? null;
}

export async function countDayOffersForBusiness(business_id: string): Promise<number> {
  return DayOffer.countDocuments({ business_id });
}

export async function createDayOffer(data: {
  user_id: string;
  business_id: string;
  product_category_id?: string;
  day: Weekday;
  discount_percent: number;
  start_date: Date;
  end_date?: Date | null;
}): Promise<IDayOffer> {
  const total = await countDayOffersForBusiness(data.business_id);
  if (total >= 7) throw new Error('You already have 7 day offers for this business.');
  const doc = new DayOffer(data as any);
  const saved = await doc.save();

  // notify all active members with a push token (fire-and-forget)
  notifyMembersNewOffer(data.business_id, data.discount_percent, data.day).catch(() => {});

  return saved;
}

async function notifyMembersNewOffer(businessId: string, discountPercent: number, day: string) {
  const business = await Business.findById(businessId).select('businessName').lean();
  const name = (business as any)?.businessName || 'A business';

  // Respect the member's newOffers preference. `$ne: false` rather than
  // `true` so members created before this field existed still get offers.
  const members = await Member.find({
    active: true,
    expoPushToken: { $ne: null },
    deletedAt: null,
    'notificationPrefs.newOffers': { $ne: false },
  })
    .select('expoPushToken')
    .lean();

  const tokens = members.map((m: any) => m.expoPushToken).filter(Boolean) as string[];
  if (!tokens.length) return;

  // send in batches of 100 (Expo limit)
  for (let i = 0; i < tokens.length; i += 100) {
    const batch = tokens.slice(i, i + 100).map((to) => ({
      to,
      title: '🎉 New Member Offer!',
      body: `${name} is offering ${discountPercent}% off every ${day}. Show your member card!`,
      data: { type: 'NEW_OFFER', businessId },
      channelId: 'member-offers',
    }));
    await sendExpoPush(batch);
  }
}

export async function listDayOffers(filters: {
  user_id?: string;
  business_id?: string;
  city?: string;
  country?: string;
}): Promise<IDayOffer[]> {
  const q: Record<string, any> = {};
  if (filters.user_id) q.user_id = filters.user_id;
  if (filters.business_id) q.business_id = filters.business_id;

  const hasCity = Boolean(filters.city?.trim());
  const hasCountry = Boolean(filters.country?.trim());

  if (hasCity || hasCountry) {
    const andClauses: any[] = [];

    if (hasCity) {
      // city matches city/division/district/thana/homeTown/address and branches.city (contains, case-insensitive)
      const cityRx = new RegExp(escapeRegex(filters.city!.trim()), 'i');
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
      const countryRx = new RegExp(`^${escapeRegex(filters.country!.trim())}$`, 'i');
      const countryOr = [
        { 'locations.country': { $regex: countryRx } },
        { 'locations.branches': { $elemMatch: { country: { $regex: countryRx } } } },
      ];
      andClauses.push({ $or: countryOr });
    }

    const bizMatch = andClauses.length ? { $and: andClauses } : {};

    // Find businesses that satisfy the location filters
    const businesses = await Business.find(bizMatch).select('_id').lean();
    const ids: Types.ObjectId[] = businesses.map((b: any) => b._id);

    // If specific business_id is provided, ensure it survives the location filter
    if (filters.business_id) {
      const matches = ids.some((id) => String(id) === String(filters.business_id));
      if (!matches) return []; // location filters exclude this business
      q.business_id = filters.business_id;
    } else {
      if (!ids.length) return []; // no businesses match location criteria
      q.business_id = { $in: ids };
    }
  }

  return DayOffer.find(q)
    .sort({ day: 1, createdAt: -1 })
    .populate('business_id');
}

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function getDayOfferById(id: string): Promise<IDayOffer | null> {
  return DayOffer.findById(id);
}

export async function updateDayOffer(
  id: string,
  updates: Partial<{
    product_category_id: string;
    day: Weekday;
    discount_percent: number;
    start_date: Date;
    end_date: Date | null;
  }>
): Promise<IDayOffer | null> {
  return DayOffer.findByIdAndUpdate(id, updates, { new: true });
}

export async function deleteDayOffer(id: string): Promise<{ message: string }> {
  await DayOffer.findByIdAndDelete(id);
  return { message: 'Day offer deleted successfully' };
}

/** Find an active offer on a given date for a weekday & business. */
export async function findActiveOfferForDate(params: {
  business_id: string;
  day: Weekday;
  onDate?: Date; // default now
}): Promise<IDayOffer | null> {
  const on = params.onDate ?? new Date();
  const startOfDay = new Date(on.getFullYear(), on.getMonth(), on.getDate());
  const endOfDay = new Date(on.getFullYear(), on.getMonth(), on.getDate(), 23, 59, 59, 999);

  return DayOffer.findOne({
    business_id: params.business_id,
    day: params.day,
    start_date: { $lte: endOfDay },
    $or: [{ end_date: null }, { end_date: { $gte: startOfDay } }],
  });
}

/**
 * Apply the business's active offer for a weekday *for today only* by
 * bulk-updating product discounts and setting discount_start/end to today.
 * Optionally scopes to product_category_id if present on the offer.
 */
export async function applyDayOfferToday(params: {
  user_id: string;
  business_id: string;
  day: Weekday; // usually today's weekday
}): Promise<{
  applied: boolean;
  discount_percent?: number;
  matchedCount: number;
  modifiedCount: number;
}> {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

  const offer = await findActiveOfferForDate({
    business_id: params.business_id,
    day: params.day,
    onDate: today,
  });

  if (!offer) {
    return { applied: false, matchedCount: 0, modifiedCount: 0 };
  }

  const filters: { user_id?: string; business_id?: string; product_category_id?: string } = {
    user_id: params.user_id,
    business_id: params.business_id,
  };
  if (offer.product_category_id) {
    filters.product_category_id = String(offer.product_category_id);
  }

  const res = await bulkUpdateDiscount(
    filters,
    offer.discount_percent,
    { discount_start: start, discount_end: end }
  );

  return {
    applied: true,
    discount_percent: offer.discount_percent,
    matchedCount: res.matchedCount,
    modifiedCount: res.modifiedCount,
  };
}



export const getMostRecentActiveOfferForToday = async ({
  business_id,
  user_id,
  product_category_id,
  day,
}: {
  business_id: string;
  user_id?: string;
  product_category_id?: string;
  day: Weekday;
}): Promise<IDayOffer | null> => {
  const now = new Date();

  const query: any = {
    business_id,
    day,
    start_date: { $lte: now },
    $or: [{ end_date: null }, { end_date: { $gte: now } }],
  };

  if (user_id) query.user_id = user_id;
  if (product_category_id) query.product_category_id = product_category_id;

  // "Most recent" = last updated, then created
  const offer = await DayOffer.findOne(query).sort({ updatedAt: -1, createdAt: -1 });

  return offer;
};