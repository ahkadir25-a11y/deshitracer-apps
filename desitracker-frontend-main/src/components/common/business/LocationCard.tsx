"use client";

import { motion } from "framer-motion";
import { FaMapMarkerAlt } from "react-icons/fa";
import React from "react";

interface Location {
  address: string;
  postCode: string;
  city: string;
  state: string;
  country: string;
  isMultipleLocation: boolean;
  branches: string[];
  homeTown: string;
  exactBusinessLocation?:string;
  division: string;
  district: string;
  thana: string;
  _id: string;
}

interface LocationCardProps {
  location: Location;
}

const LocationCard: React.FC<LocationCardProps> = ({ location }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-xl shadow-md p-6 w-full max-w-md"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <FaMapMarkerAlt className="text-[#222] text-lg" />
        <h2 className="font-semibold text-gray-800 text-base">Business Location</h2>
      </div>

      {/* Location Details */}
      <div className="space-y-2 text-sm text-gray-700">
        {/* Address */}
        {location?.address && (
          <p>
            <span className="font-semibold text-gray-900">Address:</span> {location?.address}
          </p>
        )}

        {/* Post Code */}
        {location?.postCode && (
          <p>
            <span className="font-semibold text-gray-900">Post Code:</span> {location?.postCode}
          </p>
        )}

        {/* City */}
        {location?.city && (
          <p>
            <span className="font-semibold text-gray-900">City:</span> {location?.city}
          </p>
        )}

        {/* State */}
        {location?.state && (
          <p>
            <span className="font-semibold text-gray-900">State:</span> {location?.state}
          </p>
        )}

        {/* Country */}
        {location?.country && (
          <p>
            <span className="font-semibold text-gray-900">Country:</span> {location?.country}
          </p>
        )}

        {/* Division */}
        {location?.division && (
          <p>
            <span className="font-semibold text-gray-900">Division:</span> {location?.division}
          </p>
        )}

        {/* District */}
        {location?.district && (
          <p>
            <span className="font-semibold text-gray-900">District:</span> {location?.district}
          </p>
        )}

        {/* Thana */}
        {location?.thana && (
          <p>
            <span className="font-semibold text-gray-900">Thana:</span> {location?.thana}
          </p>
        )}

        {/* Home Town */}
       

        {location?.exactBusinessLocation && (
          <p>
            <span className="font-semibold text-gray-900">Find Us:</span> {location?.exactBusinessLocation}
          </p>
        )}
        {/* Multiple Location */}
        {location?.isMultipleLocation && (
          <p>
            <span className="font-semibold text-gray-900">Multiple Locations:</span> Yes
          </p>
        )}

        {/* Branches */}
        {location?.branches && location.branches.length > 0 && (
          <div>
            <span className="font-semibold text-gray-900">Branches:</span>
            <ul className="list-disc pl-5 space-y-1">
              {location.branches.map((branch, index) => (
                <li key={index} className="text-gray-700">
                  {branch}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default LocationCard;
