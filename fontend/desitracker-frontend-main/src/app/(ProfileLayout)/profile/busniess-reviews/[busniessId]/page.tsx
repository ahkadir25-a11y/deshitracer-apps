/* eslint-disable @typescript-eslint/no-explicit-any */
import AllBusniessReviews from "@/components/profile-components/busniess-reviews/AllBusniessReviews";
import React from "react";

const BusniessReviewsPage = ({ params }: { params: any }) => {
  const { busniessId } = params;

  return <AllBusniessReviews busniessId={busniessId} />;
};

export default BusniessReviewsPage;
