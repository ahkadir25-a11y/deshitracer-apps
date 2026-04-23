/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useRef, useState } from "react";
import 'leaflet/dist/leaflet.css';
import {

  FaLink,
  FaStar,
  FaStore,
  FaTruckMoving,
} from "react-icons/fa6";
import {
  useCreateReviewMutation,
  useGetAllBusinessReviewsQuery,
} from "@/app/redux/services/business-reviews.services";
import toast from "react-hot-toast";
import { IoMenu, IoShieldCheckmark } from "react-icons/io5";
import { MdBookOnline } from "react-icons/md";
import { useAppSelector } from "@/app/redux/hoook";
import { motion } from 'framer-motion';
import OpeningHours from "./OpeningHours";
import PaymentMethods from "@/components/shears/form/PaymentMethods";
import LanguageSection from "./LanguageSection";
import BusinessMap from "./BusinessMap";
import BusinessContactCard from "./BusinessContactCard";
import BusinessOverview from "./BusinessOverview";
import BusinessHeader from "./BusinessHeader";
import FloatingSocialButtons from "./FloatingSocialButtons";
import OnlineBookingCard from "./OnlineBookingCard";
import LocationCard from "./LocationCard";
import { useAddVisitorCountMutation } from "@/app/redux/services/business.services";
import ProductsSection from "./ProductsSection";
import FloatingCartButton from "@/components/FloatingCartButton";
import { useSearchParams } from "next/navigation";
import WaiterOrderPad from "@/components/WaiterOrderPad/WaiterOrderPad";

const ReviewCard = ({ review }: { review: any }) => {
  const [expanded, setExpanded] = useState(false);

  const renderStars = (count: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <FaStar
        key={i}
        className={`text-sm ${i < count ? "text-yellow-400" : "text-gray-300"}`}
      />
    ));

  const createdAt = new Date(review.createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-md w-full max-w-md mx-auto">
      {/* Reviewer Info */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold text-sm uppercase">
          {review.name?.charAt(0) || "U"}
        </div>
        <div>
          <p className="font-semibold text-gray-800">{review.name || "Anonymous"}</p>
          <p className="text-gray-500 text-xs">Reviewed on {createdAt}</p>
        </div>
      </div>

      {/* Star Rating */}
      <div className="flex items-center gap-1 mb-2">
        {renderStars(review.rating)}
        <span className="text-xs text-gray-500 ml-2">{review.rating} Star</span>
      </div>

      {/* Feedback */}
      <p className="text-sm text-gray-700 leading-relaxed">
        {expanded || review.feedback.length <= 200
          ? review.feedback
          : `${review.feedback.slice(0, 200)}...`}
      </p>

      {review.feedback.length > 200 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-[#222] text-xs mt-1 hover:underline"
        >
          {expanded ? "Read less" : "Read more"}
        </button>
      )}
    </div>
  );
};

const ReviewsSection = ({ user, business, data }: any) => {
  const [showAll, setShowAll] = useState(false);

  const reviews = data?.data || [];
  const visibleReviews = showAll ? reviews : reviews.slice(0, 5);

  return (
    <div className="border-b border-gray-300 py-5 px-3 bg-gray-50">
      <div className="max-w-[1210px] mx-auto">

        {/* Review Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 justify-center mt-5">
          {visibleReviews.map((review: any) => (
            <ReviewCard key={review._id} review={review} />

          ))}
        </div>

        {/* View More / Less Button */}
        {reviews.length > 5 && (
          <div className="text-center mt-6">
            <button
              onClick={() => setShowAll(!showAll)}
              className="text-[#222] hover:text-blue-800 text-sm font-medium"
            >
              {showAll ? "View Less" : "View More"}
            </button>
          </div>
        )}

        {/* Show Review Form */}
        {user?.role !== "business_owner" && (
          <div className="mb-6">
            <ReviewForm businessId={business?._id} />
          </div>
        )}

      </div>
    </div>
  );
};

const ReviewForm = ({ businessId }: { businessId: string }) => {
  const [rating, setRating] = useState(3);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    review: "",
    anonymous: false,
  });
  const [createReview, { isLoading }] = useCreateReviewMutation();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      business: businessId,
      rating,
      feedback: formData.review,
      name: formData.anonymous ? "Anonymous" : formData.name,
      email: formData.anonymous ? "" : formData.email,
    };

    try {
      await createReview(payload).unwrap();
      toast.success("Feedback submitted!");
      setFormData({ name: "", email: "", review: "", anonymous: false });
      setRating(3);
    } catch (error) {
      console.log("error", error)
      const errorMessage = (error as any)?.data?.errorSources?.[0]?.message || "An unexpected error occurred.";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto bg-white p-6 rounded-2xl shadow-sm space-y-4">
      <h2 className="text-lg font-semibold text-gray-800">Feedback Us</h2>
      <p className="text-sm text-gray-500">
        Let us know how we did. We value your input!
      </p>

      {/* Stars */}
      <div className="flex gap-2 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className={`w-10 h-10 flex items-center justify-center rounded-bl-xl text-2xl rounded-sm cursor-pointer rounded-tr-xl transition 
        ${rating >= star ? "bg-[#222] text-white" : "bg-gray-200 text-white"}`}
            aria-label={`Rate ${star} star`}
          >
            ★
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {!formData.anonymous && (
          <>
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <input
              type="email"
              name="email"
              placeholder="Your Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </>
        )}

        <textarea
          name="review"
          placeholder="Write your experiences..."
          value={formData.review}
          onChange={handleChange}
          rows={3}
          required
          className="w-full px-4 py-2 text-sm border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
        />


        <button
          type="submit"
          disabled={isLoading}
          className={`w-full bg-[#222] hover:bg-blue-700 text-white font-medium py-2 rounded-md transition ${isLoading ? "opacity-60 cursor-not-allowed" : ""
            }`}
        >
          {isLoading ? "Submitting..." : "Submit Now"}
        </button>
      </form>
    </div>
  );
};

const BusinessDetails = ({ business }: { business: any }) => {
  const { data } = useGetAllBusinessReviewsQuery({
    busniessId: business?._id,
  });
  const [addVisitorCount] = useAddVisitorCountMutation();

  const { user } = useAppSelector(
    (state: { auth: { user: { role?: string } | null } }) => state.auth
  );
  // const dateCreatedAt = new Date(business?.owner?.createdAt);

  // const formattedCreatedAt = dateCreatedAt?.toLocaleString("en-US", {
  //   weekday: "long", // "Monday"
  //   year: "numeric", // "2025"
  //   month: "long", // "April"
  // });

  const reviewsRef = useRef<HTMLDivElement>(null);

  const scrollToReviews = () => {
    if (reviewsRef.current) {
      reviewsRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    // Call this when the business page loads
    if (business?._id) {
      addVisitorCount(business?._id)
        .unwrap()
        .then(() => console.log("Visitor count updated!"))
        .catch((error) => console.error("Visitor count failed:", error));
    }
  }, [business?._id]);


  const sParams = useSearchParams();

  useEffect(() => {

    if (sParams.get("redirect")) {
      const element = document.getElementById('products-offers');
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
        const next = new URLSearchParams(sParams.toString());
        next.delete("redirect");
      }
    }
  }, [sParams.get("redirect")])

  return (
    <div className=" w-full">
      <BusinessHeader business={business} scrollToReviews={scrollToReviews} />
      <motion.div
        className="border-b bg-white border-gray-300 py-5 px-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-[1210px] flex justify-between items-start mx-auto">
          <div className="grid grid-cols-3 md:grid-cols-7 gap-6 place-items-center">
            {/* Store Pickup */}
            {business?.operationDetails?.offerInStorePickup && (
              <motion.div
                className="flex flex-col items-center relative"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                <FaStore size={30} className="text-[#222]" />
                <span className="md:text-sm text-[12px] text-center mt-2 text-[#222]">
                  Store Pickup
                </span>
              </motion.div>
            )}
            {/* Online Service */}
            {business?.operationDetails?.provideOnlineService && (
              <motion.div
                className="flex flex-col items-center relative"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                <FaLink size={30} className="text-[#222]" />
                <span className="md:text-sm text-[12px] text-center mt-2 text-[#222]">
                  Online Service
                </span>
              </motion.div>
            )}
            {business?.isHalal && (
              <motion.div
                className="flex flex-col items-center relative"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                <FaLink size={30} className="text-[#222]" />
                <span className="md:text-sm text-[12px] text-center mt-2 text-[#222]">
                  Halal Service
                </span>
              </motion.div>
            )}
            {/* Special Discount */}
            {business?.features?.offerSpecialDiscount && (
              <motion.div
                className="flex flex-col items-center relative"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.6 }}
              >
                <FaStar size={30} className="text-[#222]" />
                <span className="md:text-sm text-[12px] text-center mt-2 text-[#222]">
                  Special Discount
                </span>
              </motion.div>
            )}

            {/* Wheelchair Accessible */}
            {business?.features?.isWheelChairAccessible && (
              <motion.div
                className="flex flex-col items-center relative"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
              >
                <IoShieldCheckmark size={30} className="text-[#222]" />
                <span className="md:text-sm text-[12px] text-center mt-2 text-[#222]">
                  Wheelchair Accessible
                </span>
              </motion.div>
            )}

            {/* Free Parking */}
            {business?.operationDetails?.isParkingAvailable && (
              <motion.div
                className="flex flex-col items-center relative"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <IoMenu size={30} className="text-[#222]" />
                <span className="md:text-sm text-[12px] text-center mt-2 text-[#222]">
                  Free Parking
                </span>
              </motion.div>
            )}

            {/* Online Booking */}
            {business?.operationDetails?.offerOnlineBooking && (
              <motion.div
                className="flex flex-col items-center relative"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <MdBookOnline size={30} className="text-[#222]" />
                <span className="md:text-sm text-[12px] text-center mt-2 text-[#222]">
                  Online Booking
                </span>
              </motion.div>
            )}

            {/* Home Delivery */}
            {business?.operationDetails?.provideHomeDelivery && (
              <motion.div
                className="flex flex-col items-center relative"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                <FaTruckMoving size={30} className="text-[#222]" />
                <span className="md:text-sm text-[12px] text-center mt-2 text-[#222]">
                  Home Delivery
                </span>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
      <FloatingSocialButtons
        phone={business?.contactDetails?.phoneNumber}
        facebook={business?.contactDetails?.facebook}
        instagram={business?.contactDetails?.instagram}
      />

      <div className="border-b border-gray-300 py-5 px-3">
        <OnlineBookingCard link={business?.operationDetails?.onlineBookingLink} business={business} />
        <div className="max-w-[1210px] flex md:flex-row flex-col justify-between gap-4 items-start mx-auto ">
          <BusinessOverview business={business} />
          <div className="md:w-[30%] space-y-4 w-full">
            <LocationCard location={business.locations} />
            <OpeningHours openingHours={business.openingHours} userId={business?.owner?._id} businessId={business?._id} busId={business?._id} />
            <PaymentMethods methods={business.paymentMethods} />
            <LanguageSection
              official={business?.features?.officialLanguage}
              second={business?.features?.secondLanguage}
              homeTown={business?.locations?.homeTown}
            />
            <BusinessMap location={business?.locations} />
            <BusinessContactCard contact={business?.contactDetails} />
            {/* <ListingOwnerCard
              name={business?.owner?.name}
              profilePic={business?.owner?.profilePic}
              createdAt={formattedCreatedAt}
            /> */}

          </div>
        </div>
      </div>
      {
        business?.checkoutNumber &&
        <FloatingCartButton whatsappPhoneNumber={business?.checkoutNumber} businessId={business?._id} />
      }
      {
        user?.role !== "business_owner" && (
          <div ref={reviewsRef}>
            <ReviewsSection user={user} business={business} data={data} />
          </div>
        )
      }
      <ProductsSection businessId={business?._id} userId={business?.owner?._id} />
    </div>
  );
};

export default BusinessDetails;
