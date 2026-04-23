"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";
import { useGetAllBusinessQuery } from "@/app/redux/services/business.services";
import Spinner from "@/components/shears/spiner/Spiner";
import { FaLocationDot, FaStar } from "react-icons/fa6";
import { useGetAllBusinessReviewsQuery } from "@/app/redux/services/business-reviews.services";

const BusinessCard = ({ business }: { business: any }) => {
  const { data: reviewData } = useGetAllBusinessReviewsQuery({
    busniessId: business._id,
  });

  const reviews = reviewData?.data || [];
  const totalRatings = reviews.reduce((sum: number, review: any) => sum + (review.rating || 0), 0);
  const averageRating = reviews.length > 0 ? (totalRatings / reviews.length).toFixed(1) : null;

  return (
    <Link
      href={`/business-details/${business?.slug}`}
      className="relative group h-[27rem] rounded-xl border border-gray-300 transition-all duration-300 cursor-pointer"
      style={{
        backgroundImage: `url(${business.media?.thumbnail[0]?.url ? business.media?.thumbnail[0]?.url : business.media?.images[0]?.url})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black rounded-xl opacity-10 z-0"></div>

      <div className="absolute bottom-0 w-full">
        <div className="relative bg-white rounded-b-xl border-t shadow-xl border-gray-300 text-black flex flex-col text-center justify-between transition-all duration-500 z-40 p-4">
          <h2 className="text-lg font-semibold">{business?.businessName}</h2>

          <div className="flex items-center justify-center mt-2 text-xs">
            <FaLocationDot className="text-[#faea04]" size={20} />
            <p className="ml-1">
              {business.locations?.city}, {business.locations?.country}
            </p>
          </div>

          <div className="flex items-center justify-center gap-1 text-yellow-500 text-sm mt-2">
            {averageRating ? (
              <>
                <span>{averageRating} / 5</span>
                <div className="flex">
                  {Array.from({ length: 5 }, (_, i) => (
                    <FaStar
                      key={i}
                      className={i < Math.round(Number(averageRating)) ? "text-yellow-400" : "text-gray-300"}
                    />
                  ))}
                </div>
                <span className="text-gray-600 ml-1">
                  ({reviews.length} {reviews.length === 1 ? "review" : "reviews"})
                </span>
              </>
            ) : (
              <span className="text-gray-500">No reviews</span>
            )}
          </div>

          <div className="flex justify-center mt-4">
            <button className="text-white cursor-pointer bg-[#222] px-4 py-2 rounded-md text-sm">
              View Details →
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};


export default function TopRatedBusinesses() {
  const { data, isLoading } = useGetAllBusinessQuery({ isActive: true });

  if (isLoading) return <Spinner />;

  const businesses = data?.data?.slice(0, 8) || [];

  return (
    <div className="max-w-[1300px] pb-20 md:pt-0 px-2 pt-10 mx-auto">
      <h2 className="md:text-4xl text-2xl font-normal text-center mb-2 text-black">
        New Listed Business
      </h2>
      <p className="text-gray-600 md:text-md text-sm text-center mb-6">
        Discover the most loved businesses in your community
      </p>

      {businesses.length === 0 ? (
        <div className="mt-12 text-center text-gray-500">
          <p>No new businesses found.</p>
          <p>Please check back later or try another location.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {businesses.map((business: any) => (
              <BusinessCard key={business._id} business={business} />
            ))}
          </div>

          <div className="flex justify-center mt-10">
            <Link href="/business">
              <button className="px-6 cursor-pointer py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition">
                See All Businesses
              </button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}