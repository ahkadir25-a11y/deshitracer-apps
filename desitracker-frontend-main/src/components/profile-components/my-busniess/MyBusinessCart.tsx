/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import Image from "next/image";
import React, { useMemo } from "react";
import { FaMapMarkerAlt } from "react-icons/fa";
import { CiEdit } from "react-icons/ci";
import { useDeleteBusinessMutation } from "@/app/redux/services/business.services";
import toast from "react-hot-toast";
import Spinner from "@/components/shears/spiner/Spiner";
import Link from "next/link";
import { BiSolidTrash } from "react-icons/bi";

const MyBusinessCart = ({ business }: { business: any }) => {
  const [deleteBusiness, { isLoading }] = useDeleteBusinessMutation();

  // ✅ detect restaurant type (supports "Restaurant" + common typo "Resturent")
  const isRestaurant = useMemo(() => {
    const raw = business?.selectedType ?? "";
    const t = String(raw).toLowerCase().trim();
    return /(restaura?nt|resturent)/i.test(t);
  }, [business?.selectedType]);

  const handleDelete = async (slug: string) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this business?"
    );
    if (!isConfirmed) return;

    try {
      await deleteBusiness(slug);
      toast.success("Business deleted successfully!");
    } catch (error) {
      toast.error("Error deleting the business. Please try again.");
    }
  };

  if (isLoading) return <Spinner />;

  return (
    <div className="flex md:flex-row flex-col border-b border-neutral-200 overflow-hidden bg-white relative">
      {/* Image Section */}
      <div className="md:w-1/5 h-full border-r border-gray-200 p-3">
        {business?.media?.thumbnail?.[0]?.url ? (
          <Image
            height={300}
            width={300}
            src={business.media.thumbnail[0].url}
            alt="Business Logo"
            className="object-cover rounded"
          />
        ) : (
          <div className="w-full h-[300px] flex items-center justify-center bg-gray-100 text-gray-500 rounded">
            No thumbnail
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="flex flex-col w-full justify-between md:w-4/5">
        {/* Header */}
        <Link
          href={`/business-details/${business?.slug}`}
          className="w-full p-4 cursor-pointer"
        >
          <div className="flex items- justify-end">
            {business?.isActive ? (
              <span className="text-xs text-white bg-black px-2.5 py-1 rounded-full">
                Approved
              </span>
            ) : (
              <span className="text-xs text-white bg-red-500 px-2.5 py-1 rounded-full">
                Pending
              </span>
            )}
          </div>

          <div className="flex items-center justify-between mt-1">
            <h2 className="text-lg font-semibold underline">
              {business?.businessName}
            </h2>
          </div>

          {/* Location */}
          <div className="mt-2 text-sm text-gray-600 flex items-start gap-2">
            <FaMapMarkerAlt className="mt-0.5" />
            <p>
              <span>{business.locations.city}</span>,{" "}
              <span>{business.locations.country}</span>
            </p>
          </div>

          {/* Description */}
          <div className="mt-2 text-sm text-gray-600">
            <span>{business.about}</span>
          </div>
        </Link>

        {/* Footer */}
        <div className="flex items-center p-4 justify-between w-full mt-4 border-t border-neutral-200 pt-2 text-sm text-gray-700">
          {/* Rating */}
          <div className="flex items-center gap-1">
            <span className="text-yellow-500">★★★★☆</span>
            <Link
              href={`/profile/busniess-reviews/${business?._id}`}
              className="underline cursor-pointer hover:text-blue-400"
            >
              (Reviews)
            </Link>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* ✅ Take Order button only for restaurant business */}
            {isRestaurant && business?.slug && (
              <Link
                href={`/take-order/${encodeURIComponent(business.slug)}`}
                className="inline-flex items-center justify-center rounded-md bg-emerald-600 text-white px-3 py-1.5 text-xs font-medium hover:bg-emerald-700"
                title="Take Order"
              >
                Take Order
              </Link>
            )}

            <Link
              href={`/profile/my-busniess/edit/${business?.slug}`}
              className="cursor-pointer hover:text-orange-600 transition-all duration-300"
              title="Edit"
            >
              <CiEdit size={20} />
            </Link>

            <button
              onClick={() => handleDelete(business?.slug)}
              className="cursor-pointer hover:text-red-600 transition-all duration-300"
              title="Delete"
            >
              <BiSolidTrash size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyBusinessCart;