/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useGetBusinessQuery } from "@/app/redux/services/business.services";
import BusinessDetails from "@/components/common/business/BusinessListingDetails";
import GroupImageSlider from "@/components/shears/slider/GroupImageSlider";
import Spinner from "@/components/shears/spiner/Spiner";
import React from "react";

const BusinessDetailsPage = ({ params }: { params: any }) => {
  const { slug } = params;
  const { data, isLoading } = useGetBusinessQuery(slug);
  if (isLoading) {
    return <Spinner />;
  }
  const business = data.data;

  return (
    <div className="bg-gray-100 w-full h-full">
      <GroupImageSlider images={business.media.images} />
      <BusinessDetails business={business} />
    </div>
  );
};

export default BusinessDetailsPage;
