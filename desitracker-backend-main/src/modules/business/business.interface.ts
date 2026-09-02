import { Schema, Types } from 'mongoose';

export type TContactDetails = {
  phoneNumber: string;
  email: string;
  websiteUrl: string;
  facebook: string;
  instagram: string;
  linkedin: string;
  twitter: string;
};

export type TBranch = {
  branchName?: string;
  address: string;
  postCode: string;
  city: string;
  state: string;
  country: string;
};

export type TLocation = {
  address: string;
  exactBusinessLocation: string;
  division?: string;
  district?: string;
  homeTown?: string;
  thana?: string;
  postCode?: string;
  city?: string;
  state: string;
  country: string;
  isMultipleLocation: boolean;
  branches?: TBranch[];
  lat?: string;
  long?: string;

  // Country-neutral tier. Bangladesh fills `division`, the UK a county, Brazil
  // a state — `region` is whichever of those this country actually uses, so a
  // query does not have to know the local vocabulary. The named fields above
  // stay exactly as they are and keep being written.
  locality?: string;
  region?: string;
  countryCode?: string;

  // The geographic source of truth. [longitude, latitude] — GeoJSON order,
  // which is the reverse of how people say it.
  geo?: { type: 'Point'; coordinates: [number, number] };
  // Where the point came from, so an estimate is never mistaken for a fact.
  geoSource?: 'device' | 'map' | 'geocoded';
};

export type TOperationDetails = {
  businessHours: {
    start: Date;
    end: Date;
  };
  provideHomeDelivery?: boolean;
  provideOnlineService?: boolean;
  offerInStorePickup?: boolean;
  isParkingAvailable?: boolean;
  offerOnlineBooking?: boolean;
  onlineBookingLink?: string;
  whatsappNumber?: string
  menuLink?: string
};

type TPaymentMethod = 'Cash' | 'Card' | 'PayPal' | 'Apple Pay';

type TFoodOptions = 'Halal' | 'Kosher' | 'Vegan';

export type TFeatures = {
  officialLanguage: string;
  secondLanguage?: string;
  acceptedPaymentMethod: TPaymentMethod;
  offerSpecialDiscount: boolean;
  isWheelChairAccessible: boolean;
  foodOptions: TFoodOptions;
};

export type TMediaUnit = {
  url: string;
  description: string;
};

export type TMedia = {
  thumbnail?: TMediaUnit[];
  images: TMediaUnit[];
  videos: TMediaUnit[];
};
export interface TOpeningHour {
  day: string; // e.g., "Monday"
  start: string; // e.g., "09:00"
  end: string;   // e.g., "17:00"
}

export const OpeningHourSchema = new Schema<TOpeningHour>({
  day: { type: String, required: true },
  start: { type: String },
  end: { type: String },
});

export type TServiceSettings = {
  isReservationEnabled: boolean;
  isPickupEnabled: boolean;
  isDeliveryEnabled: boolean;
  maxGuestsPerReservation?: number;
  deliveryRadiusKm?: number;
  minOrderValueDelivery?: number;
};

// Per-business switches for the email alerts sent to the owner. Both default
// to true so existing businesses keep getting notified until they opt out.
export type TNotificationSettings = {
  emailOnNewOrder?: boolean;
  emailOnNewReservation?: boolean;
};

export type TBusiness = {
  businessName: string;
  checkoutNumber: string;
  slug: string;
  owner: Types.ObjectId;
  category: Types.ObjectId;
  subCategory?: Types.ObjectId;
  selectedType?: string; // Added selectedType field
  description: string;
  established?: Date;
  about?: string;
  logo: string;
  coverPhotoUrl?: string;
  contactDetails: TContactDetails;
  locations: TLocation;
  currency?: string;
  operationDetails: TOperationDetails;
  features: TFeatures;
  media: TMedia;
  howToHearAboutDesiTracker: string;
  agreeToTermsConditions: boolean;
  hasCustomerTestimonials: boolean;
  isDeleted: boolean;
  isActive: boolean;
  isHalal: boolean;
  isTrash: boolean;
  openingHours: TOpeningHour[];
  googleMapLink: string;
  paymentMethods: string[];
  serviceSettings?: TServiceSettings;
  notificationSettings?: TNotificationSettings;
  managerPin?: string; // hashed; used for risky-action approval at POS
};
