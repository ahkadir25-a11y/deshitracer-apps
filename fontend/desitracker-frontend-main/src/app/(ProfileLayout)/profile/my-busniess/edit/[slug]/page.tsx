/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import BusniessEditForm from "@/components/shears/form/BusniessEditForm";
import React from "react";

const MyBusniessEditPage = ({ params }: { params: any }) => {
  const { slug } = params; // Directly access slug without async/await
  return <BusniessEditForm slug={slug} />;
};

export default MyBusniessEditPage;
