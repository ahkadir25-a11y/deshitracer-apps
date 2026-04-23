import React from "react";
import { FaMapMarkerAlt, FaGlobe, FaPhoneAlt } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";
interface BusinessType {
  businessName: string;
  slug: string;
  category?: {
    name: string;
  };
  subCategory?: {
    name: string;
  };
  isActive: boolean;
  media?: {
    images?: { url: string }[];
    thumbnail?: { url: string }[];
  };
  locations?: {
    city?: string;
    state?: string;
    country?: string;
  };
  about?: string;
  contactDetails?: {
    phoneNumber?: string;
    websiteUrl?: string;
  };
  operationDetails?: {
    provideOnlineService?: boolean;
    provideHomeDelivery?: boolean;
    offerInStorePickup?: boolean;
    offerOnlineBooking?: boolean;
  };
}

const BusinessCard = ({ business }: { business: BusinessType }) => {
  const {
    businessName,
    slug,
    category,
    subCategory,
    media,
    locations,
    about,
    contactDetails,
    operationDetails,
  } = business;

  return (
    <Link
      href={`/business-details/${slug}`}
      className="block bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition overflow-hidden"
    >
      <div className="md:flex">
        {/* Left: Logo */}
        <div className="md:w-1/4 w-full h-44 md:h-auto relative">
          <Image
            src={
              media?.thumbnail?.[0]?.url
                ? media.thumbnail[0].url
                : media?.images?.[0]?.url
                ? media.images[0].url
                : "/placeholder.png"
            }
            alt={businessName}
            fill
            className="object-cover"
          />
          <span
            className={`absolute top-2 left-2 px-3 py-1 text-xs rounded-full text-white bg-`}
          >
           Verified
          </span>
        </div>

        {/* Right: Content */}
        <div className="md:w-3/4 w-full p-4 flex flex-col justify-between">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-800">{businessName}</h2>
            <div className="flex gap-2 text-xs text-gray-600 flex-wrap">
              <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                {category?.name}
              </span>
              {subCategory && (
                <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">
                  {subCategory?.name}
                </span>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center text-sm text-gray-600 mt-2 gap-2">
            <FaMapMarkerAlt className="text-gray-500" />
            <span>
              {locations?.city}, {locations?.state}, {locations?.country}
            </span>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-700 mt-2 line-clamp-2">{about}</p>

          {/* Contact + Tags */}
          <div className="flex flex-wrap items-center justify-between mt-3 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <FaPhoneAlt />
              <span>{contactDetails?.phoneNumber}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaGlobe />
              <span className="truncate max-w-[150px]">{contactDetails?.websiteUrl}</span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-3">
            {operationDetails?.provideOnlineService && (
              <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs">
                Online Service
              </span>
            )}
            {operationDetails?.provideHomeDelivery && (
              <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs">
                Home Delivery
              </span>
            )}
            {operationDetails?.offerInStorePickup && (
              <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-xs">
                In-store Pickup
              </span>
            )}
            {operationDetails?.offerOnlineBooking && (
              <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">
                Online Booking
              </span>
            )}
          </div>

        
        </div>
      </div>
    </Link>
  );
};

export default BusinessCard;
