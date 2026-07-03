import mongoose, { model, Schema } from 'mongoose';
import {
  OpeningHourSchema,
  TBranch,
  TBusiness,
  TContactDetails,
  TFeatures,
  TLocation,
  TMedia,
  TMediaUnit,
  TNotificationSettings,
  TOperationDetails,
  TServiceSettings,
} from './business.interface';

const MediaUnitSchema = new Schema<TMediaUnit>({
  url: { type: String, required: true },
  description: { type: String, default: '' },
});

const MediaSchema = new Schema<TMedia>({
  thumbnail: { type: [MediaUnitSchema], default: [] },
  images: { type: [MediaUnitSchema], default: [] },
  videos: { type: [MediaUnitSchema], default: [] },
});

const ContactDetailsSchema = new Schema<TContactDetails>({
  phoneNumber: { type: String, required: true },
  email: { type: String, required: true },
  websiteUrl: { type: String, default: '' },
  facebook: { type: String, default: '' },
  instagram: { type: String, default: '' },
  linkedin: { type: String, default: '' },
  twitter: { type: String, default: '' },
});

const BranchSchema = new Schema<TBranch>({
  branchName: { type: String },
  address: { type: String, required: true },
  postCode: String,
  city: { type: String, required: true },
  country: { type: String, required: true },
});

const LocationSchema = new Schema<TLocation>({
  address: { type: String, required: true },
  division: { type: String },
  district: { type: String },
  thana: { type: String },
  homeTown: { type: String },
  exactBusinessLocation: { type: String },
  postCode: String,
  city: { type: String },
  country: { type: String, required: true },
  isMultipleLocation: { type: Boolean, required: true },
  branches: { type: [BranchSchema], default: [] },
});

const OperationDetailsSchema = new Schema<TOperationDetails>({
  provideHomeDelivery: { type: Boolean, default: false },
  provideOnlineService: { type: Boolean, default: false },
  offerInStorePickup: { type: Boolean, default: false },
  isParkingAvailable: { type: Boolean, default: false },
  offerOnlineBooking: { type: Boolean, default: false },
  onlineBookingLink: { type: String, default: '' },
  whatsappNumber: { type: String, default: '' },
  menuLink: { type: String, default: '' },
});

const FeaturesSchema = new Schema<TFeatures>({
  officialLanguage: { type: String, required: true },
  secondLanguage: { type: String },
  offerSpecialDiscount: { type: Boolean, default: false },
  isWheelChairAccessible: { type: Boolean, default: false },
  foodOptions: {
    type: String,
    enum: ['Halal', 'Kosher', 'Vegan'],
  },
});

const ServiceSettingsSchema = new Schema<TServiceSettings>({
  isReservationEnabled: { type: Boolean, default: false },
  isPickupEnabled: { type: Boolean, default: false },
  isDeliveryEnabled: { type: Boolean, default: false },
  maxGuestsPerReservation: { type: Number, default: 10 },
  deliveryRadiusKm: { type: Number, default: 5 },
  minOrderValueDelivery: { type: Number, default: 0 },
});

// Email-alert switches for the owner. Default ON so notifications keep working
// for existing businesses; the owner can turn them off in Service Settings.
const NotificationSettingsSchema = new Schema<TNotificationSettings>({
  emailOnNewOrder: { type: Boolean, default: true },
  emailOnNewReservation: { type: Boolean, default: true },
});

const BusinessSchema = new Schema<TBusiness>(
  {
    businessName: { type: String, unique: true, required: true, trim: true },
    slug: { type: String, unique: true, required: true, trim: true },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Category',
    },
    checkoutNumber: { type: String },
    subCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Subcategory' },
    description: { type: String },
    selectedType: { type: String },
    established: { type: Date },
    about: { type: String },
    logo: { type: String },
    contactDetails: { type: ContactDetailsSchema, required: true },
    locations: { type: LocationSchema, required: true },
    operationDetails: { type: OperationDetailsSchema, required: true },
    features: { type: FeaturesSchema, required: true },
    media: { type: MediaSchema, required: true },
    howToHearAboutDesiTracker: { type: String },
    agreeToTermsConditions: { type: Boolean, required: true },
    hasCustomerTestimonials: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isHalal: { type: Boolean, default: true },
    isTrash: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    openingHours: { type: [OpeningHourSchema], default: [] },
    paymentMethods: { type: [String], default: [] },
    serviceSettings: {
      type: ServiceSettingsSchema,
      default: () => ({}),
    },
    notificationSettings: {
      type: NotificationSettingsSchema,
      default: () => ({}),
    },
    // Hashed PIN used by managers / owners to approve risky waiter actions
    // (large discounts, void approvals, table transfers). Optional —
    // if unset, the business hasn't enabled PIN-based approvals.
    managerPin: { type: String, select: false, default: undefined },
  },
  { timestamps: true },
);

export const Business = model<TBusiness>('Business', BusinessSchema);
