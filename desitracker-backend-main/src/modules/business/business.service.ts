import bcrypt from 'bcrypt';
import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { Types } from 'mongoose';
import config from '../../config';
import AppError from '../../errors/AppError';
import sendEmail from '../../utils/lib/sendEmail';
import { stringToSlug } from '../../utils/lib/slug';
import QueryBuilder from '../../utils/queryBuilder';
import { VisitorCountServices } from '../analytics/businessVisitorCount/visitorCount.service';
import { USER_ROLE } from '../user/auth/auth.constants';
import { User } from '../user/user/user.model';
import { TBusiness } from './business.interface';
import { Business } from './business.model';
import { getBusinessApprovedTemplate } from './business.template';
import { cleanupBusinessRelations } from '../../utils/lib/cascadeCleanup';

// Fill the country-neutral location fields from whatever the country actually
// sent, and turn a coordinate pair into the GeoJSON point the database can
// index. Runs on create and on update, and only ever ADDS: every named field
// the caller sent is left exactly as it arrived.
//
// Nothing here invents data. A missing or out-of-range coordinate leaves `geo`
// alone rather than storing a point in the Gulf of Guinea, which is where
// (0, 0) puts a business that never gave one.
const normaliseLocation = (payload: any) => {
  const loc = payload?.locations;
  if (!loc || typeof loc !== 'object') return payload;

  // The region tier under its local names: division in Bangladesh, a county in
  // the UK, a state in Brazil. Whichever arrived becomes `region` too.
  if (!loc.region) {
    const region = loc.region || loc.division || loc.state;
    if (region) loc.region = region;
  }

  // Coordinates arrive as strings from the form.
  const lat = Number(loc.lat);
  const lng = Number(loc.long);
  const usable =
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lng) <= 180 &&
    !(lat === 0 && lng === 0);

  if (usable && !loc.geo) {
    // GeoJSON is [longitude, latitude] — the reverse of how it is spoken.
    loc.geo = { type: 'Point', coordinates: [lng, lat] };
    if (!loc.geoSource) loc.geoSource = 'device';
  }

  return payload;
};

const registerBusiness = async (payload: TBusiness) => {
  normaliseLocation(payload);

  if (!payload?.businessName) {
    throw new AppError(400, 'Business name is required');
  }

  if (!payload?.owner) {
    throw new AppError(400, 'Business Owner is required');
  }

  const isOwner = await User.findById(payload?.owner);

  if (!isOwner) {
    throw new AppError(404, 'Business Owner is not found.');
  }

  // One owner, one business. The app assumes this everywhere — the dashboard
  // loads the owner's FIRST business and has no way to switch, so a second one
  // is invisible while its staff, orders and takings quietly belong to a
  // business the owner cannot see.
  const existing = await Business.findOne({
    owner: payload.owner,
    isDeleted: false,
  }).select('_id businessName');
  if (existing) {
    throw new AppError(
      409,
      `This account already has a business (${existing.businessName}). Each account can register one business.`,
    );
  }

  const slug = stringToSlug(payload.businessName);

  const result = await Business.create({ ...payload, slug, isActive: true });

  if (!result) {
    throw new AppError(500, 'failed to create Business');
  }

    sendEmail({
      email: isOwner?.email,
      subject: `Business Listing Approved – Desi Tracker`,
      message: getBusinessApprovedTemplate(
        `Business Listing Approved – Desi Tracker`,
        result?.businessName,
      ),
    }).catch(emailError => {
      console.error('Failed to send email to owner:', emailError);
    });

    sendEmail({
      email: config.adminEmail,
      subject: `Let's Welcome a new business: ${result.businessName} `,
      message: `${result?.businessName} is registered to your application. Owner name is: ${isOwner?.name}`,
    }).catch(emailError => {
      console.error('Failed to send email to admin:', emailError);
    });

  return result;
};

const updateBusiness = async (
  slug: string,
  payload: Partial<TBusiness>,
  decodedUser: JwtPayload,
) => {
  normaliseLocation(payload);

  const business = await Business.findOne({ slug });
  if (!business) {
    throw new AppError(404, `Business with slug ${slug} is not found`);
  }

  // Authorize on ownership of THIS business (or admin). The previous check only
  // ran for role 'user', but the route only admits ADMIN/BUSINESS_OWNER, so it
  // was dead code — any owner could edit any other owner's business by slug.
  const isAdmin = decodedUser?.role === USER_ROLE.ADMIN;
  const isOwnerOfThis =
    decodedUser?.id?.toString() === business?.owner?.toString();
  if (!isAdmin && !isOwnerOfThis) {
    throw new AppError(
      403,
      `You are not authorized to modify business with slug ${slug}.`,
    );
  }

  // Only an admin may reassign ownership. A non-admin owner editing their own
  // business cannot hand it (or seize someone else's) by setting a new `owner`.
  if (!isAdmin && payload?.owner && payload.owner.toString() !== business.owner.toString()) {
    throw new AppError(403, 'Only an admin can change the business owner.');
  }

  if (!payload?.owner) {
    throw new AppError(400, 'Business Owner is required');
  }

  const isOwner = await User.findById(payload?.owner);

  if (!isOwner) {
    throw new AppError(404, 'Business Owner is not found.');
  }

  let newSlug;

  if (payload?.businessName) {
    newSlug = stringToSlug(payload.businessName);
  }
  console.log(payload?.media)
  const result = await Business.findOneAndUpdate(
    { slug },
    { ...payload, slug: newSlug ? newSlug : business.slug },
    {
      new: true,
      runValidators: true,
    },
  );

  if (!result) {
    throw new AppError(404, `Business with slug ${slug} is not found`);
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
};

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

const getAllBusiness = async (query: Record<string, unknown>) => {
  const newQuery: Record<string, unknown> = {};

  // Basic fields
  if (query?.searchTerm) newQuery.searchTerm = query.searchTerm;
  if (query?.businessName) newQuery.businessName = query.businessName;
  if (query?.owner) newQuery.owner = new Types.ObjectId(query.owner as string);
  if (query?.slug) newQuery.slug = query.slug;
  if (query?.category)
    newQuery.category = new Types.ObjectId(query.category as string);
  if (query?.subCategory)
    newQuery.subCategory = new Types.ObjectId(query.subCategory as string);
  if (query?.established) newQuery.established = query.established;
  if (query?.isDeleted !== undefined) newQuery.isDeleted = query.isDeleted;
  if (query?.isActive !== undefined) {
    newQuery.isActive = query.isActive === 'true'; // Correctly convert 'true' string to boolean true
  }

  if (query?.isHalal !== undefined) newQuery.isHalal = query.isHalal === 'true';
  if (query?.howToHearAboutDesiTracker)
    newQuery.howToHearAboutDesiTracker = query.howToHearAboutDesiTracker;

  // Features filtering
  if (query?.acceptedPaymentMethod)
    newQuery['features.acceptedPaymentMethod'] = query.acceptedPaymentMethod;
  if (query?.officialLanguage)
    newQuery['features.officialLanguage'] = query.officialLanguage;
  if (query?.secondLanguage)
    newQuery['features.secondLanguage'] = query.secondLanguage;
  if (query?.foodOptions)
    newQuery['features.foodOptions'] = query.foodOptions;
  if (query?.offerSpecialDiscount !== undefined)
    newQuery['features.offerSpecialDiscount'] =
      query.offerSpecialDiscount === 'true';
  if (query?.isWheelChairAccessible !== undefined)
    newQuery['features.isWheelChairAccessible'] =
      query.isWheelChairAccessible === 'true';

  // Contact details
  if (query?.phoneNumber)
    newQuery['contactDetails.phoneNumber'] = query.phoneNumber;
  if (query?.email) newQuery['contactDetails.email'] = query.email;

  // Operation details
  if (query?.provideHomeDelivery !== undefined)
    newQuery['operationDetails.provideHomeDelivery'] =
      query.provideHomeDelivery === 'true';
  if (query?.provideOnlineService !== undefined)
    newQuery['operationDetails.provideOnlineService'] =
      query.provideOnlineService === 'true';
  if (query?.offerInStorePickup !== undefined)
    newQuery['operationDetails.offerInStorePickup'] =
      query.offerInStorePickup === 'true';
  if (query?.isParkingAvailable !== undefined)
    newQuery['operationDetails.isParkingAvailable'] =
      query.isParkingAvailable === 'true';
  if (query?.offerOnlineBooking !== undefined)
    newQuery['operationDetails.offerOnlineBooking'] =
      query.offerOnlineBooking === 'true';
  if (query?.onlineBookingLink)
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
  if (query?.city) newQuery['locations.city'] = query.city;
  if (query?.country) newQuery['locations.country'] = query.country;

  //
  // Wrapped in $and, not a bare $or: QueryBuilder.search() already puts an
  // $or on the query for searchTerm, and two $or keys on the same find would
  // overwrite each other — silently breaking search for anyone who also
  // filtered by region.
  const regionValue = query?.region || query?.division || query?.state;
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
  if (query?.page) newQuery.page = parseInt(query.page as string);
  if (query?.limit) newQuery.limit = parseInt(query.limit as string);

  // Log the query to verify

  const businessQuery = new QueryBuilder<TBusiness>(
    Business.find({ isDeleted: false }).populate([
      { path: 'owner', model: 'User' },
      { path: 'category', model: 'Category' },
      { path: 'subCategory', model: 'Subcategory' },
    ]),
    newQuery
  )
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
  const result = await businessQuery.modelQuery;
  const meta = await businessQuery.countTotal(); // Get the total count of results

  return {
    meta,
    result,
  };
};

const getSingleBusiness = async (slug: string, req: Request) => {
  const query = Types.ObjectId.isValid(slug) ? { $or: [{ _id: slug }, { slug }] } : { slug };
  const result = await Business.findOne(query).populate([
    { path: 'owner', model: 'User' },
    { path: 'category', model: 'Category' },
    { path: 'subCategory', model: 'Subcategory' },
  ]);

  if (!result) {
    throw new AppError(404, `Business with slug ${slug} is not found`);
  }

  await VisitorCountServices.addToVisitorCount(result?._id?.toString(), req);

  return result;
};

const deleteBusiness = async (slug: string, decodedUser: JwtPayload) => {
  const business = await Business.findOne({ slug });
  if (!business) {
    throw new AppError(404, `Business with slug ${slug} is not found`);
  }

  // Only the owner of THIS business (or an admin) may delete it. An owner can
  // delete their own business if they leave the platform — but cannot delete
  // anyone else's. (Was previously gated on role 'user', which never matched.)
  const isAdmin = decodedUser?.role === USER_ROLE.ADMIN;
  const isOwnerOfThis =
    decodedUser?.id?.toString() === business?.owner?.toString();
  if (!isAdmin && !isOwnerOfThis) {
    throw new AppError(
      403,
      `You are not authorized to delete the business with slug ${slug}.`,
    );
  }

  // Cascade-clean every record tied to this business (staff, orders, bookings,
  // reviews, shifts, inventory, etc.) so nothing is left pointing at a deleted
  // business. Auto-discovers all related collections — see cascadeCleanup.ts.
  await cleanupBusinessRelations(business._id);

  // Delete the business
  const result = await Business.findByIdAndUpdate(
    business._id,
    { isDeleted: true },
    { new: true, runValidators: true },
  );

  if (!result) {
    throw new AppError(404, `Business with slug ${slug} is not found`);
  }

  return result;
};

const getAllBusinessListings = async (query: Record<string, unknown>) => {
  const newQuery: Record<string, unknown> = {};

  // Helper function to check if the value is valid (not empty, not false, and not "false")
  const isValidValue = (value: any) => {
    return (
      value !== '' &&
      value !== false &&
      value !== 'false' &&
      value !== undefined &&
      value !== null
    );
  };

  // Check if value is valid before adding to query
  const addFilterIfValid = (key: string, value: any) => {
    if (isValidValue(value)) {
      newQuery[key] = value;
    }
  };

  // Basic Fields
  addFilterIfValid('searchTerm', query?.searchTerm);
  addFilterIfValid('businessName', query?.businessName);
  addFilterIfValid(
    'owner',
    query?.owner ? new Types.ObjectId(query?.owner as string) : undefined,
  );
  addFilterIfValid('slug', query?.slug);
  addFilterIfValid(
    'category',
    query?.category
      ? new Types.ObjectId(query?.category as string)
      : undefined,
  );
  addFilterIfValid(
    'subCategory',
    query?.subCategory
      ? new Types.ObjectId(query?.subCategory as string)
      : undefined,
  );
  addFilterIfValid('established', query?.established);
  addFilterIfValid('isDeleted', query?.isDeleted);
  addFilterIfValid('isActive', query?.isActive === "true");
  addFilterIfValid(
    'howToHearAboutDesiTracker',
    query?.howToHearAboutDesiTracker,
  );

  // Features Filtering
  addFilterIfValid(
    'features.acceptedPaymentMethod',
    query?.acceptedPaymentMethod,
  );
  addFilterIfValid('features.officialLanguage', query?.officialLanguage);
  addFilterIfValid('features.foodOptions', query?.foodOptions);
  addFilterIfValid(
    'features.offerSpecialDiscount',
    query?.offerSpecialDiscount,
  );
  addFilterIfValid(
    'features.isWheelChairAccessible',
    query?.isWheelChairAccessible,
  );

  // Contact Details
  addFilterIfValid('contactDetails.phoneNumber', query?.phoneNumber);
  addFilterIfValid('contactDetails.email', query?.email);

  // Operation Details
  addFilterIfValid(
    'operationDetails.provideHomeDelivery',
    query?.provideHomeDelivery,
  );
  addFilterIfValid(
    'operationDetails.provideOnlineService',
    query?.provideOnlineService,
  );
  addFilterIfValid(
    'operationDetails.offerInStorePickup',
    query?.offerInStorePickup,
  );
  addFilterIfValid(
    'operationDetails.isParkingAvailable',
    query?.isParkingAvailable,
  );
  addFilterIfValid(
    'operationDetails.offerOnlineBooking',
    query?.offerOnlineBooking,
  );
  addFilterIfValid(
    'operationDetails.onlineBookingLink',
    query?.onlineBookingLink,
  );

  // Location Filtering
  addFilterIfValid('locations.city', query?.city);
  addFilterIfValid('locations.state', query?.state);
  addFilterIfValid('locations.country', query?.country);
  // Build query with the valid filters
  const businessQuery = new QueryBuilder<TBusiness>(
    Business.find({ isDeleted: false, isActive: true }).populate([
      { path: 'owner', model: 'User' },
      { path: 'category', model: 'Category' },
      { path: 'subCategory', model: 'Subcategory' },
    ]),
    newQuery,
  )
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
  const result = await businessQuery.modelQuery;
  const meta = await businessQuery.countTotal();

  return {
    meta,
    result,
  };
};

const setManagerPin = async (businessId: string, pin: string) => {
  const raw = (pin || '').trim();
  if (!/^\d{4,8}$/.test(raw)) {
    throw new AppError(400, 'PIN must be 4-8 digits');
  }
  const hashed = await bcrypt.hash(raw, 10);
  const updated = await Business.findByIdAndUpdate(
    businessId,
    { managerPin: hashed },
    { new: true }
  );
  if (!updated) throw new AppError(404, 'Business not found');
  return { ok: true };
};

const verifyManagerPin = async (businessId: string, pin: string) => {
  const raw = (pin || '').trim();
  if (!raw) throw new AppError(400, 'PIN is required');
  const biz = await Business.findById(businessId).select('+managerPin');
  if (!biz) throw new AppError(404, 'Business not found');
  if (!biz.managerPin) {
    throw new AppError(400, 'Manager PIN not configured for this business');
  }
  const ok = await bcrypt.compare(raw, biz.managerPin);
  if (!ok) throw new AppError(401, 'Incorrect PIN');
  return { ok: true };
};

export const BusinessServices = {
  registerBusiness,
  updateBusiness,
  getAllBusiness,
  getSingleBusiness,
  deleteBusiness,
  getAllBusinessListings,
  setManagerPin,
  verifyManagerPin,
};
