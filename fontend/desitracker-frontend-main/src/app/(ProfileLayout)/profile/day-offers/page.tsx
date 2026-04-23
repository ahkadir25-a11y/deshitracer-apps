/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import React from "react";
import { useAppSelector } from "@/app/redux/hoook";

import {
  useGetAllBusinessQuery,
} from "@/app/redux/services/business.services";
import DayOffersManager from "@/components/DayOffersManager";



const MyProducts: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth) as {
    user: { id: string };
  };

  const { data: businessData } = useGetAllBusinessQuery({
    owner: user?.id || "",
  });


  return (
    <div className="mx-auto max-w-7xl px-5 py-6 bg-[#F7F9FB]">
      <DayOffersManager businessId={businessData?.data?.[0]?._id} userId={user?.id} />

    </div>
  );
};

export default MyProducts;
