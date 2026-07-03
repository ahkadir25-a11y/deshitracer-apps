"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import Image from "next/image";
import { IoCall, IoShieldCheckmark } from "react-icons/io5";
import { useState } from "react";
import { useGetAllBusinessReviewsQuery } from "@/app/redux/services/business-reviews.services";
import { useGetUserByIdQuery } from "@/app/redux/services/auth.services";

const BusinessHeader = ({ business, scrollToReviews }: { business: any; scrollToReviews: () => void }) => {
  const [logoError, setLogoError] = useState(false);
  const { data } = useGetAllBusinessReviewsQuery({
    busniessId: business?._id,
  });
  const { data: userData } = useGetUserByIdQuery(business?.owner?._id);

  const reviews = data?.data || [];
  const totalRatings = reviews.reduce((sum: number, review: any) => sum + (review.rating || 0), 0);
  const averageRating = reviews.length > 0 ? (totalRatings / reviews.length).toFixed(1) : null;


  return (
    <div className="border-b bg-white border-gray-200 py-6 px-4">
      <div className="max-w-[1210px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          {/* Left: Logo + Info */}
          <div className="flex flex-col sm:flex-row gap-5 items-start md:items-center">
            {!logoError && business?.logo ? (
              <Image
                src={business.logo}
                alt="Business Logo"
                width={96}
                height={96}
                onError={() => setLogoError(true)}
                className="w-24 h-24 object-cover rounded-sm border border-gray-300"
              />
            ) : (
              <div className="w-24 h-24 rounded-sm bg-gray-100 flex items-center justify-center text-sm text-gray-400 border border-dashed border-gray-300">
                No Logo
              </div>
            )}

            <div>
              <h1 className="text-2xl font-semibold text-gray-800">{business?.businessName || 'N/A'}</h1>
              <div className="flex flex-wrap gap-2 text-sm mt-1 text-gray-500">
                <span className="flex items-center text-[#222] font-semibold gap-1">
                  <IoShieldCheckmark size={16} />
                  Verified
                </span>
              </div>

              {/* ⭐ Average Rating and Review Count */}
              <div onClick={scrollToReviews} className="flex items-center cursor-pointer gap-1 mt-2">
                <span className="text-lg font-bold text-yellow-500">
                  {averageRating ? `${averageRating} / 5` : "N/A"}
                </span>
                <div className="flex gap-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <svg
                      key={i}
                      className={`w-5 h-5 ${averageRating && i < Math.round(Number(averageRating)) ? 'text-yellow-400' : 'text-gray-300'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.35 4.162h4.388c.969 0 1.371 1.24.588 1.81l-3.557 2.58 1.35 4.162c.3.921-.755 1.688-1.539 1.118L10 13.011l-3.557 2.58c-.783.57-1.838-.197-1.539-1.118l1.35-4.162-3.557-2.58c-.783-.57-.38-1.81.588-1.81h4.388l1.35-4.162z" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm text-gray-600 ml-1">
                  ({reviews.length} {reviews.length === 1 ? "review" : "reviews"})
                </span>
              </div>
            </div>
          </div>

         
          {userData?.data?.phone && (
            <a
              href={`tel:${userData?.data?.phone}`}
              className="bg-[#222] hover:bg-black text-white px-5 py-3 rounded-md flex items-center gap-2 text-sm transition whitespace-nowrap"
              target="_blank"
              rel="noopener noreferrer"
            >
              <IoCall size={18} />
              Contact This Business
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusinessHeader;
