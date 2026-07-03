/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React from "react";
import { useAppSelector } from "@/app/redux/hoook";
import { useGetAllBusinessQuery } from "@/app/redux/services/business.services";
import AddNewLink from "@/components/shears/button/AddNewLink";
import ProfileHeader from "@/components/shears/dashboard/profile-layout/ProfileHeader";
import BusniessAnimationSpiner from "@/components/shears/spiner/BusniessAnimationSpiner";
import MyBusinessCart from "./MyBusinessCart";
const MyBusniessComponents = () => {
  const { user } = useAppSelector((state) => state.auth) as {
    user: { id: string } | null;
  };
  const { data, isLoading: busniessLoading } = useGetAllBusinessQuery({
    owner: user?.id || "",
  });
  if (busniessLoading) {
    return <BusniessAnimationSpiner />;
  }
  return (
    <div className="h-full">
      <ProfileHeader>
        <span className="text-2xl flex  justify-between items-center">
          {"My Listings"}
        </span>
      </ProfileHeader>
      {data?.data?.length > 0 ? (
        <div className="pt-5 space-y-4">
          {data?.data.map((business: any) => (
            <MyBusinessCart key={business._id} business={business} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center h-full justify-center">
          {(data?.data?.length || 0) === 0 && (
            <AddNewLink path="/auth/signin" />
          )}
        </div>
      )}
    </div>
  );
};

export default MyBusniessComponents;
