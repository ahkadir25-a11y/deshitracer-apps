"use client";
import dynamic from "next/dynamic";
import React from "react";
const BusinessFilterPanel = dynamic(
  () => import("@/components/common/business/BusinessFilterPanel"),
  {
    ssr: false, // This disables SSR and forces it to be client-side rendered
  }
);
const BusinessSearchListingPage = () => {
  return (
    <div>
      <BusinessFilterPanel />
    </div>
  );
};

export default BusinessSearchListingPage;
